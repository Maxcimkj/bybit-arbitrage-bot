require('log-timestamp');
const { log, error } = console;

const arbitrage = require("./arbitrage");
const order = require("./order");
const wallet = require("./wallet");

const initialize = async () => {
  await arbitrage.getPairs();
  await wallet.startListenWallet();
  arbitrage.wsconnect();
  order.startListenOrders();
};

initialize();