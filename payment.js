require('log-timestamp');
const { log, error } = console;
const { sort } = require("fast-sort");
const { RestClientV5 } = require("bybit-api");
const { promisify } = require("util");
const delay = promisify(setTimeout);
const {Mutex, withTimeout, tryAcquire, E_ALREADY_LOCKED} = require("async-mutex");

const order = require("./order");
const wallet = require("./wallet");

const spotApi = new RestClientV5({
    key: 'HEDYZXOUXECBYTYXHD',
    secret: 'SNOZZYVTAWONHPFWZLLQMBLRBIDUAZCLATEU',
    recv_window: 10000
});
const paymentMutex = new Mutex();

const callPayment = async (coin, precision, minAmount, symbol, side) => {    
    console.log("Call payment: ", coin, precision, minAmount, symbol, side)
    
    console.log("Waiting for the replenishment of the balance");
    while(wallet.balance[coin] < minAmount) {
        await delay(20);
    }
    const coinBalance = wallet.balance[coin];
    console.log("Coin balance: ", coinBalance);
    
    const amount = floorPrecised(coinBalance, precision);
    console.log("Payment amount: ", coinBalance, amount);
    
    const submitOrderResponse = await spotApi.submitOrder({
        category: 'spot',
        side: side,
        symbol: symbol,
        qty: amount,
        orderType: 'Market'
    });
    if (submitOrderResponse.retCode != 0) {
        console.log("SubmitOrderResponse error: ", submitOrderResponse.retCode, submitOrderResponse.retMsg);
        return null;
    }
    console.log("SubmitOrderResponse success:", submitOrderResponse);
    
    const orderId = submitOrderResponse.result.orderId;
    
    console.log("Waiting order result");
    while(order.filledOrders[orderId] === undefined) {
        await delay(20);
    }
    const orderAmount = order.filledOrders[orderId];
    console.log("Order filled: amount=", orderAmount);
    return orderAmount;
}

async function makeArbitrageInternal(bestPair) {
    console.log("Start arbitrage: ", bestPair);
    const firstOrderQty = await callPayment(
        bestPair.d1,
        bestPair.lv1Precision,
        bestPair.lv1MinAmount,
        bestPair.lv1,  
        bestPair.l1 == 'den' ? 'Buy' : 'Sell'
    );
    if (firstOrderQty === null) {
        console.log("First order error");
        return;
    }
    console.log("First order released: ", bestPair.lv1, firstOrderQty);
            
    const secondOrderQty = await callPayment(
        bestPair.d2,
        bestPair.lv2Precision,
        bestPair.lv2MinAmount,
        bestPair.lv2,
        bestPair.l2 == 'den' ? 'Buy' : 'Sell'
    );
    if (secondOrderQty === null) {
        console.log("Second order error");
        return;
    }
    console.log("Second order released: ", bestPair.lv2, secondOrderQty);
            
    const thirdOrderQty = await callPayment(
        bestPair.d3,
        bestPair.lv3Precision,
        bestPair.lv3MinAmount,
        bestPair.lv3, 
        bestPair.l3 == 'den' ? 'Buy' : 'Sell'
    );
    console.log("Third order released: ", bestPair.lv3, thirdOrderQty);
    if (thirdOrderQty === null) {
        console.log("Third order error");
        return;
    }
    
    // 5m
    await delay(300000);
};

function floorPrecised(number, precision) {
	var power = Math.pow(10, precision);
  	return (Math.floor(number * power) / power).toFixed(precision);
}


function makeArbitrage(bestPair) {
      tryAcquire(paymentMutex)
          .acquire()
          .then(async function(release) {
            await makeArbitrageInternal(bestPair);
            
            console.log("Finish arbitrage");
            release();
          })
          .catch(e => {
              if (e === E_ALREADY_LOCKED) {
//                 console.log("Payment already in process");
              }
          });
}

module.exports = { makeArbitrage };
