import { Router } from "express";
import { TwitterApi } from "twitter-api-v2";
import { setDoc, doc, getDoc } from "firebase/firestore";
import db from "../firebase";

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
  const docRef = doc(db, "tokens", "twitter");
  const docSnap = await getDoc(docRef);

  // @ts-ignore
  const { refreshToken } = docSnap.data();

  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await twitterClient.refreshOAuth2Token(refreshToken);

  await setDoc(doc(db, "tokens", "twitter"), {
    accessToken,
    refreshToken: newRefreshToken,
  });

  const { data } = await refreshedClient.v2.tweet("Hello world!");

  res.send(data);
});

export default twitterRoutes;
