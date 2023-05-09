const { WebsocketClient } = require("bybit-api");

//{
//    "id": "592324803b2785-26fa-4214-9963-bdd4727f07be",
//    "topic": "execution",
//    "creationTime": 1672364174455,
//    "data": [
//        {
//            "category": "linear",
//            "symbol": "XRPUSDT",
//            "execFee": "0.005061",
//            "execId": "7e2ae69c-4edf-5800-a352-893d52b446aa",
//            "execPrice": "0.3374",
//            "execQty": "25",
//            "execType": "Trade",
//            "execValue": "8.435",
//            "isMaker": false,
//            "feeRate": "0.0006",
//            "tradeIv": "",
//            "markIv": "",
//            "blockTradeId": "",
//            "markPrice": "0.3391",
//            "indexPrice": "",
//            "underlyingPrice": "",
//            "leavesQty": "0",
//            "orderId": "f6e324ff-99c2-4e89-9739-3086e47f9381",
//            "orderLinkId": "",
//            "orderPrice": "0.3207",
//            "orderQty": "25",
//            "orderType": "Market",
//            "stopOrderType": "UNKNOWN",
//            "side": "Sell",
//            "execTime": "1672364174443",
//            "isLeverage": "0",
//            "closedSize": ""
//        }
//    ]
//}
//https://bybit-exchange.github.io/docs/v5/websocket/private/execution

let filledOrders = {};
let successStatuses = ['PartiallyFilledCanceled', 'Filled'];
let failedStatuses = ['Cancelled', 'Rejected', 'Deactivated'];

const startListenOrders = () => {
    const wsClient = new WebsocketClient({
      key: 'HEDYZXOUXECBYTYXHD',
      secret: 'SNOZZYVTAWONHPFWZLLQMBLRBIDUAZCLATEU',
      market: 'v5'
    });
    
    wsClient.on('update', (data) => {
      console.log('Order message ', JSON.stringify(data, null, 2));
      
      if (!successStatuses.includes(data.data[0].orderStatus) 
        && !failedStatuses.includes(data.data[0].orderStatus)) {
        console.log('Order is processing. Skip message ');
        return;
      }
      
      filledOrders[data.data[0].orderId] = { 
        execQty: data.data[0].cumExecQty, 
        status: (successStatuses.includes(data.data[0].orderStatus)) ? 'success' : 'failed'
      };
    });
   
    wsClient.subscribe(['order']);     
};

module.exports = { startListenOrders, filledOrders };