# WebSockets-Nodejs-

In this application I have shown real time trading data from binance exchange on the client side using websockets.
One websocket is built to stream the data from express server to the frontend client and one websocket is made at the backend using ccxws
to get the real data.
Authentication and authorisation is given using JWT tokens and streaming of real time data is made only for the signed in users.
An index.html is given on test folder to test the websocket part only. (To test it remove the protect controller from the market route)
