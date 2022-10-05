import { BinanceClient } from "ccxws";

let clients = {}; // map userId to the exchange client
let marketMap = {}; //map userId to the market

export let myClients = {}; //map userId to the frontend clients
export let sockets = {}; //map userId(front-end : server) to userId(server : ccxws)

export const getUniqueID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4() + "-" + s4();
};

export const getData = (req, res) => {
  try {
    const { id, base, quote } = req.params; //choose market
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
      sockets[socketId].sendUTF(trade_);
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

export const disconnect = (id) => {
  //closes the websocket connection of server and ccxws
  const market = marketMap[id];
  clients[id].unsubscribeTrades(market);
  clients[id].unsubscribeLevel2Snapshots(market);
  delete clients.id;
  delete marketMap.id;
};

/*
  we provide a method of explicitly closing the connection with ccxws through this controller
*/
export const closeSocket = (req, res) => {
  try {
    const { id } = req.params; //id which corresponding to the ccxws websocket
    disconnect(id);
    res.status(201).json({
      status: "success",
      message: "Unsubscribed",
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
