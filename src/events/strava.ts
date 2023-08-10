import { Router } from "express";

const stravaRoutes = Router();

stravaRoutes.get("/strava", (req, res) => {
  const hubChallenge = req.query["hub.challenge"];
  res.json({ "hub.challenge": hubChallenge });
});

stravaRoutes.post("/strava", (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

export default stravaRoutes;
