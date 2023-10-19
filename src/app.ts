import express, { json, Application } from "express";
import { startDatabase } from "./database";
import { createMovie, deleteMovie, showMovie, updateMovie } from "./functions";
import { verifyCreation, verifyUpdate } from "./middlewares";

const app: Application = express();
app.use(json());

app.post("/movies", verifyCreation, createMovie);
app.get("/movies", showMovie);
app.patch("/movies/:id", verifyUpdate, updateMovie);
app.delete("/movies/:id", deleteMovie);

const PORT: number = 3000;
const runningMsg: string = `Server running on http://localhost:${PORT}`;
app.listen(PORT, async () => {
  await startDatabase();
  console.log(runningMsg);
});
