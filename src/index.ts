import app from "./server";

const port = 1234;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}!!!`);
});
