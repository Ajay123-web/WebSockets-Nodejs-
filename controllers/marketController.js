import { BinanceClient } from "ccxws";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
let clients = {}; // map userId to the exchange client
let marketMap = {}; //map userId to the market

let myClients = {}; //map userId to the frontend clients
let sockets = {}; //map userId(front-end : server) to userId(server : ccxws)

const getUniqueID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4() + "-" + s4();
};

wss.on("request", function (request) {
  const userId = getUniqueID();
  const connection = request.accept(null, request.origin);
  connection.sendUTF(userId); //send the userId back to client
  clients[userId] = connection;

  connection.on("close", function (connection) {
    delete myClients[userId];
    disconnect(sockets[userId]);
  });
});

export const getData = (req, res) => {
  //choose market
  try {
    const { id, base, quote } = req.params;
    const { socketId } = req.body;
    //check validity ( if () throw "Fields for MARKET Object not Correct"; )
    const market = {
      id: id,
      base: base,
      quote: quote,
    };
    const userId = getUniqueID();
    const binance = new BinanceClient();

    clients[userId] = binance;
    marketMap[userId] = market;

    sockets[socketId] = userId;

    binance.on("trade", (trade) => {
      let trade_ = JSON.stringify(trade);
      Object.keys(myClients).map((client) => {
        myClients[client].sendUTF(trade_);
      });
    });
    //binance.on("l2snapshot", (snapshot) => console.log(snapshot));

    binance.subscribeTrades(market);
    binance.subscribeLevel2Snapshots(market);
    res.status(201).json({
      status: "success",
      message: "Subscribed",
      data: {
        userId,
      },
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const disconnect = (id) => {
  const market = marketMap[id];
  clients[id].unsubscribeTrades(market);
  clients[id].unsubscribeLevel2Snapshots(market);
  delete clients.id;
  delete marketMap.id;
};

export const closeSocket = (req, res) => {
  try {
    const { id } = req.params;
    disconnect(id);
    res.status(201).json({
      status: "success",
      message: "Unsubscribed",
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
