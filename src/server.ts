import express, { Express } from "express";
import morgan from "morgan";
import cors from "cors";
import stravaRoutes from "./events/strava";
import { addDoc, collection } from "firebase/firestore";
import db from "./firebase";

const app: Express = express();
app.use(morgan("dev")); // logs requests to the console
app.use(express.json()); // creates an object from the request body
app.use(express.urlencoded({ extended: true })); // creates an object from the request url
app.use(cors()); // allows requests from other origins

app.get("/", async (_req, res) => {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      first: "Alan",
      middle: "Mathison",
      last: "Turing",
      born: 1912,
    });
    console.log("Document written with ID: ", docRef.id);
    res.send("success");
  } catch (e) {
    console.error("Error adding document: ", e);
    res.send("error");
  }
});

app.use("/api", stravaRoutes);
export default app;
