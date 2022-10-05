import express from "express";
//import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "./routes/userRoutes.js";
import marketRouter from "./routes/marketRoutes.js";
import http from "http";
import { WebSocketServer } from "ws";
import {
  getUniqueID,
  myClients,
  sockets,
  disconnect,
} from "./controllers/marketController.js";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server: server });

wss.on("connection", function connection(ws) {
  const userId = getUniqueID();
  ws.send(userId); //send the userId back to client
  myClients[userId] = ws;
  ws.on("close", function (connection) {
    delete myClients[userId];
    if (sockets[userId]) {
      disconnect(sockets[userId]);
    }
  });
});

const PORT = 3000;

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
//app.use(cors());
app.use((req, res, next) => {
  res.removeHeader("Cross-Origin-Resource-Policy");
  res.removeHeader("Cross-Origin-Embedder-Policy");
  next();
});

/*
To connect with mongoDB

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Mongo Connected"))
  .catch((error) => console.log(`${error} did not connect`));

*/

app.use("/api/v1/user", userRouter);
app.use("/api/v1/market", marketRouter);

server.listen(PORT, () => console.log("Server Running"));
