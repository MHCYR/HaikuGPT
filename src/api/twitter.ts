import { Router } from "express";
import { TwitterApi } from "twitter-api-v2";
import OpenAI from "openai";
import { setDoc, doc, getDoc } from "firebase/firestore";
import db from "../firebase";
import dotenv from "dotenv";
import openai from "../openai";
const axios = require("axios").default;

interface StravaActivity {
  name: string;
  sport_type: string;
  max_heartrate: number;
  average_heartrate: number;
  elev_high: number;
  location_city: string;
}

dotenv.config();

const twitterRoutes = Router();

const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID as string,
  clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
});

const callbackURL =
  "https://mauditsgpt-production.up.railway.app/twitter/callback";

twitterRoutes.get("/auth", async (_req, res) => {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callbackURL,
    { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] },
  );

  // store verifier
  await setDoc(doc(db, "tokens", "twitter"), { codeVerifier, state });

  res.redirect(url);
});

twitterRoutes.get("/callback", async (req, res) => {
  const { state, code } = req.query;
  const docRef = doc(db, "tokens", "twitter");
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return res.status(401).send("No tokens stored");
  }

  const { codeVerifier, state: storedState } = docSnap.data();

  if (state !== storedState) {
    return res.status(401).send("Stored tokens do not match");
  }

  const {
    client: loggedClient,
    accessToken,
    refreshToken,
  } = await twitterClient.loginWithOAuth2({
    code: code as string,
    codeVerifier,
    redirectUri: callbackURL,
  });

  await setDoc(doc(db, "tokens", "twitter"), { accessToken, refreshToken });

  const { data } = await loggedClient.v2.me(); // start using the client if you want

  res.send(data);
});

twitterRoutes.get("/tweet", async (_req, res) => {
  const twitterDocRef = doc(db, "tokens", "twitter");
  const twitterDocSnap = await getDoc(twitterDocRef);
  const stravaDocRef = doc(db, "tokens", "strava");
  const stravaDocSnap = await getDoc(stravaDocRef);

  // @ts-ignore
  const { refreshToken } = twitterDocSnap.data();

  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await twitterClient.refreshOAuth2Token(refreshToken);

  await setDoc(doc(db, "tokens", "twitter"), {
    accessToken,
    refreshToken: newRefreshToken,
  });

  // @ts-ignore
  const { access_token } = stravaDocSnap.data();

  try {
    const response = await axios.get(
      "https://www.strava.com/api/v3/athlete/activities",
      { headers: { Authorization: `Bearer ${access_token}` } },
    );

    const lastActivity: StravaActivity = response.data[0];

    const openaiParams: OpenAI.Chat.CompletionCreateParamsNonStreaming = {
      model: "gpt-3.5-turbo",
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            "You are a haiku writer who takes inspiration to write haikus from a recorded strava activity",
        },
        { role: "user", content: JSON.stringify(lastActivity) },
      ],
    };

    const completion: OpenAI.Chat.ChatCompletion =
      await openai.chat.completions.create(openaiParams);

    const haiku = completion.choices[0].message.content;
    const { data } = await refreshedClient.v2.tweet(`${haiku}`);
    res.send(data);
  } catch (e) {
    console.error(e);
    res.status(401).send("Error getting activities");
  }
});

twitterRoutes.get("/get_activities", async (_req, res) => {
  const docRef = doc(db, "tokens", "strava");
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return res.status(401).send("No tokens stored");
  }

  // @ts-ignore
  const { access_token } = docSnap.data();
  console.log(access_token);

  try {
    const response = await axios.get(
      "https://www.strava.com/api/v3/athlete/activities",
      { headers: { Authorization: `Bearer ${access_token}` } },
    );

    const lastActivity: StravaActivity = response.data[0];

    const openaiParams: OpenAI.Chat.CompletionCreateParamsNonStreaming = {
      model: "gpt-3.5-turbo",
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            "You are a haiku writer who takes inspiration to write haikus from a recorded strava activity",
        },
        { role: "user", content: JSON.stringify(lastActivity) },
      ],
    };

    const completion: OpenAI.Chat.ChatCompletion =
      await openai.chat.completions.create(openaiParams);

    const haiku = completion.choices[0].message.content;

    res.send(haiku);
  } catch (e) {
    console.error(e);
  }
});

export default twitterRoutes;
