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
const mutex = new Mutex();

const callLimitOrder = async (coin, precision, minAmount, symbol, side, timeInForce, price) => {    
    console.log("Call limit order: ", coin, precision, minAmount, symbol, side, timeInForce, price);
    
    console.log("Waiting for the replenishment of the balance");
    while(wallet.balance[coin] < minAmount) {
        await delay(20);
    }
    const coinBalance = wallet.balance[coin];
    console.log("Coin balance: ", coinBalance);
    
    const amount = (side == 'Buy' ? coinBalance/price : coinBalance);
    const roundAmount = floorPrecised(amount, precision);
    console.log("Payment amount: ", coinBalance, roundAmount);
    
    const submitOrderResponse = await spotApi.submitOrder({
        category: 'spot',
        side: side,
        symbol: symbol,
        qty: roundAmount,
        orderType: 'Limit',
        timeInForce: timeInForce,
        price: price
    });
    if (submitOrderResponse.retCode != 0) {
        console.log("SubmitOrderResponse error: ", submitOrderResponse.retCode, submitOrderResponse.retMsg);
        return { status: 'failed' };
    }
    console.log("SubmitOrderResponse success:", submitOrderResponse);
    
    const orderId = submitOrderResponse.result.orderId;
    
    console.log("Waiting order result", orderId);
    while(order.filledOrders[orderId] === undefined) {
        await delay(20);
    }
    const orderObj = order.filledOrders[orderId];
    console.log("Order filled ", orderObj);
    return orderObj;
}

const callMarketOrder = async (coin, precision, minAmount, symbol, side) => {    
    console.log("Call market order: ", coin, precision, minAmount, symbol, side);
    
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
        return { status: 'failed' };
    }
    console.log("SubmitOrderResponse success:", submitOrderResponse);
    
    const orderId = submitOrderResponse.result.orderId;
    
    console.log("Waiting order result", orderId);
    while(order.filledOrders[orderId] === undefined) {
        await delay(20);
    }
    const orderObj = order.filledOrders[orderId];
    console.log("Order filled ", orderObj);
    return orderObj;
}

async function makeArbitrageInternal(pair) {
    const bestPair = JSON.parse(JSON.stringify(pair));
    console.log("Start arbitrage: ", bestPair);
    
    const firstOrderQty = await callLimitOrder(
        bestPair.d1,
        bestPair.lv1BasePrecision,
        bestPair.lv1MinTradeAmt,
        bestPair.lv1,  
        bestPair.l1 == 'den' ? 'Buy' : 'Sell',
        'IOC',
        bestPair.lv1Price
    );
    if (firstOrderQty.status != 'success') {
        console.log("First order error");
        // 30s
        await delay(30000);
        return;
    }
    console.log("First order released: ", bestPair.lv1, firstOrderQty);
            
    const secondOrderQty = await callLimitOrder(
        bestPair.d2,
        bestPair.l2 == bestPair.lv2BasePrecision,
        bestPair.l2 == 'den' ? bestPair.lv2MinTradeAmt: bestPair.lv2MinTradeQty,
        bestPair.lv2,
        bestPair.l2 == 'den' ? 'Buy' : 'Sell',
        'FOK',
        bestPair.lv2Price
    );
    if (secondOrderQty.status != 'success') {
        console.log("Second order is failed or cancelled. Return first order");
        
        const firstOrderReturn = await callMarketOrder(
            bestPair.d2,
            bestPair.lv1BasePrecision,
            bestPair.lv1MinTradeQty,
            bestPair.lv1,
            'Sell'
        );
        console.log("Fist order revert: ", bestPair.lv1, firstOrderReturn);
        if (firstOrderReturn.status != 'success') {
            console.log("First order revert is failed or cancelled");
            // 48h  
            await delay(172800000);
            return;
        }
        console.log("First order revert released: ", bestPair.lv1, firstOrderReturn);
        
        // 30s
        await delay(30000);
        return;
    }
    console.log("Second order released: ", bestPair.lv2, secondOrderQty);
            
    const thirdOrderQty = await callMarketOrder(
        bestPair.d3,
        bestPair.l3 == 'den' ? bestPair.lv3QuotePrecision : bestPair.lv3BasePrecision,
        bestPair.l3 == 'den' ? bestPair.lv3MinTradeAmt: bestPair.lv3MinTradeQty,
        bestPair.lv3, 
        bestPair.l3 == 'den' ? 'Buy' : 'Sell'
    );
    console.log("Third order released: ", bestPair.lv3, thirdOrderQty);
    if (thirdOrderQty.status != 'success') {
        console.log("Third order is failed or cancelled");
        // 48h  
        await delay(172800000);
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
      tryAcquire(mutex)
          .acquire()
          .then(async function(release) {
            console.log("Start arbitrage: ", bestPair);
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
