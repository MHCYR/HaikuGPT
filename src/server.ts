import express, { Express } from "express";
import morgan from "morgan";

const app: Express = express();
app.use(morgan("dev")); // logs requests to the console
app.use(express.json()); // creates an object from the request body
app.use(express.urlencoded({ extended: true })); // creates an object from the request url

app.get("/", (_req, res) => {
  res.send("Hello Wjaslkdfjaorld!");
});

export default app;
