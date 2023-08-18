import { Router } from "express";
import { setDoc, doc, getDoc } from "firebase/firestore";
import db from "../firebase";
import dotenv from "dotenv";

dotenv.config();

const axios = require("axios").default;

const stravaRoutes = Router();

stravaRoutes.get("/strava", (req, res) => {
  const hubChallenge = req.query["hub.challenge"];
  res.json({ "hub.challenge": hubChallenge });
});

stravaRoutes.get("/auth", (_req, res) => {
  const clientId = 111760;
  const redirectUri =
    "https://mauditsgpt-production.up.railway.app/api/callback";
  res.redirect(
    `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&approval_prompt=force&scope=read_all`,
  );
});

stravaRoutes.get("/callback", async (req, res) => {
  const { code } = req.query;
  const docRef = doc(db, "tokens", "strava");

  const queryParams = {
    client_id: 111760,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: "authorization_code",
  };

  try {
    const response = await axios.post(
      `https://www.strava.com/oauth/token?client_id=${queryParams.client_id}&client_secret=${queryParams.client_secret}&code=${code}&grant_type=${queryParams.grant_type}`,
    );
    console.log(response);
    const { access_token, refresh_token } = response.data;
    await setDoc(docRef, { access_token, refresh_token });
    res.send("success");
  } catch (e) {
    console.log(e);
    res.status(401).send("Error on token exchange");
  }
  res.send("success");
});

stravaRoutes.post("/strava", (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

// stravaRoutes.get("/get_activities", async (_req, res) => {
//   const docRef = doc(db, "tokens", "strava");
//   const docSnap = getDoc(docRef);

//   if (!docSnap.exists()) {
//     return res.status(401).send("No tokens stored");
//   }
//   try {
//     const { access_token } = docSnap.data();
//     const response = await axios.get(
//       `https://www.strava.com/api/v3/athlete/activities?access_token=${access_token}`,
//     );
//     res.send(response.data);
//   }
// });

export default stravaRoutes;
