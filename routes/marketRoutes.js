import express from "express";
//import { protect } from "../controllers/userController.js";
import { getData, closeSocket } from "../controllers/marketController.js";

const router = express.Router();

router.get("/:id/:base/:quote", getData);
router.patch("/:id", closeSocket);

export default router;

//http://localhost:3000/api/v1/market/BTCUSDT/BTC/USDT
