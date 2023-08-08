import express, { Express } from "express";
import morgan from "morgan";

const app: Express = express();
app.use(morgan("dev")); // logs requests to the console
app.use(express.json()); // creates an object from the request body
app.use(express.urlencoded({ extended: true })); // creates an object from the request url

const port = 1234;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}!!!`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
