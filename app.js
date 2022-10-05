import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "./routes/userRoutes.js";
import marketRouter from "./routes/marketRoutes.js";

export const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

//app.use("/api/v1/user", userRouter);
app.use("/api/v1/market", marketRouter);

app.listen(PORT, () => console.log("Server Running"));
