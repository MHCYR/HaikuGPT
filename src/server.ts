import express, { Express } from "express";
import morgan from "morgan";
import cors from "cors";
import stravaRoutes from "./events/strava";

const app: Express = express();
app.use(morgan("dev")); // logs requests to the console
app.use(express.json()); // creates an object from the request body
app.use(express.urlencoded({ extended: true })); // creates an object from the request url
app.use(cors()); // allows requests from other origins

app.get("/", (_req, res) => {
  res.send("Hello Wjaslkdfjaorld!");
});

app.use("/api", stravaRoutes);
export default app;
