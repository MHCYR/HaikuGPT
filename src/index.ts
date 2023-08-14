import app from "./server";
import dotenv from "dotenv";

dotenv.config();

const port = 1234;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}!!!`);
});
