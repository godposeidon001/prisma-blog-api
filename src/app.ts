import express, { Application } from "express";
import { postRouter } from "./modules/post/post.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";

const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth)); //need to add splat to match all routes under /api/auth, otherwise it will only match /api/auth exactly and not /api/auth/login or /api/auth/register etc.

app.use(express.json());

app.use("/posts", postRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

export default app;
