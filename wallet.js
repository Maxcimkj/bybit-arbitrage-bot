const { WebsocketClient } = require("bybit-api");
const { RestClientV5 } = require("bybit-api");

const spotApi = new RestClientV5({
    key: 'HEDYZXOUXECBYTYXHD',
    secret: 'SNOZZYVTAWONHPFWZLLQMBLRBIDUAZCLATEU',
    recv_window: 10000
});


//{
//    "retCode": 0,
//    "retMsg": "OK",
//    "result": {
//        "list": [
//            {
//                "totalEquity": "18070.32797922",
//                "accountIMRate": "0.0101",
//                "totalMarginBalance": "18070.32797922",
//                "totalInitialMargin": "182.60183684",
//                "accountType": "UNIFIED",
//                "totalAvailableBalance": "17887.72614237",
//                "accountMMRate": "0",
//                "totalPerpUPL": "-0.11001349",
//                "totalWalletBalance": "18070.43799271",
//                "accountLTV": "0.017",
//                "totalMaintenanceMargin": "0.38106773",
//                "coin": [
//                    {
//                        "availableToBorrow": "2.5",
//                        "bonus": "0",
//                        "accruedInterest": "0",
//                        "availableToWithdraw": "0.805994",
//                        "totalOrderIM": "0",
//                        "equity": "0.805994",
//                        "totalPositionMM": "0",
//                        "usdValue": "12920.95352538",
//                        "unrealisedPnl": "0",
//                        "borrowAmount": "0",
//                        "totalPositionIM": "0",
//                        "walletBalance": "0.805994",
//                        "cumRealisedPnl": "0",
//                        "coin": "BTC"
//                    }
//                ]
//            }
//        ]
//    },
//    "retExtInfo": {},
//    "time": 1672125441042
//}
//https://bybit-exchange.github.io/docs/v5/account/wallet-balance

//{
//    "id": "5923242c464be9-25ca-483d-a743-c60101fc656f",
//    "topic": "wallet",
//    "creationTime": 1672364262482,
//    "data": [
//        {
//            "accountIMRate": "0.016",
//            "accountMMRate": "0.003",
//            "totalEquity": "12837.78330098",
//            "totalWalletBalance": "12840.4045924",
//            "totalMarginBalance": "12837.78330188",
//            "totalAvailableBalance": "12632.05767702",
//            "totalPerpUPL": "-2.62129051",
//            "totalInitialMargin": "205.72562486",
//            "totalMaintenanceMargin": "39.42876721",
//            "coin": [
//                {
//                    "coin": "USDC",
//                    "equity": "200.62572554",
//                    "usdValue": "200.62572554",
//                    "walletBalance": "201.34882644",
//                    "availableToWithdraw": "0",
//                    "availableToBorrow": "1500000",
//                    "borrowAmount": "0",
//                    "accruedInterest": "0",
//                    "totalOrderIM": "0",
//                    "totalPositionIM": "202.99874213",
//                    "totalPositionMM": "39.14289747",
//                    "unrealisedPnl": "74.2768991",
//                    "cumRealisedPnl": "-209.1544627",
//                    "bonus": "0"
//                },
//                {
//                    "coin": "BTC",
//                    "equity": "0.06488393",
//                    "usdValue": "1023.08402268",
//                    "walletBalance": "0.06488393",
//                    "availableToWithdraw": "0.06488393",
//                    "availableToBorrow": "2.5",
//                    "borrowAmount": "0",
//                    "accruedInterest": "0",
//                    "totalOrderIM": "0",
//                    "totalPositionIM": "0",
//                    "totalPositionMM": "0",
//                    "unrealisedPnl": "0",
//                    "cumRealisedPnl": "0",
//                    "bonus": "0"
//                },
//                {
//                    "coin": "ETH",
//                    "equity": "0",
//                    "usdValue": "0",
//                    "walletBalance": "0",
//                    "availableToWithdraw": "0",
//                    "availableToBorrow": "26",
//                    "borrowAmount": "0",
//                    "accruedInterest": "0",
//                    "totalOrderIM": "0",
//                    "totalPositionIM": "0",
//                    "totalPositionMM": "0",
//                    "unrealisedPnl": "0",
//                    "cumRealisedPnl": "0",
//                    "bonus": "0"
//                },
//                {
//                    "coin": "USDT",
//                    "equity": "11726.64664904",
//                    "usdValue": "11613.58597018",
//                    "walletBalance": "11728.54414904",
//                    "availableToWithdraw": "11723.92075829",
//                    "availableToBorrow": "2500000",
//                    "borrowAmount": "0",
//                    "accruedInterest": "0",
//                    "totalOrderIM": "0",
//                    "totalPositionIM": "2.72589075",
//                    "totalPositionMM": "0.28576575",
//                    "unrealisedPnl": "-1.8975",
//                    "cumRealisedPnl": "0.64782276",
//                    "bonus": "0"
//                },
//                {
//                    "coin": "EOS3L",
//                    "equity": "215.0570412",
//                    "usdValue": "0",
//                    "walletBalance": "215.0570412",
//                    "availableToWithdraw": "215.0570412",
//                    "availableToBorrow": "0",
//                    "borrowAmount": "0",
//                    "accruedInterest": "",
//                    "totalOrderIM": "0",
//                    "totalPositionIM": "0",
//                    "totalPositionMM": "0",
//                    "unrealisedPnl": "0",
//                    "cumRealisedPnl": "0",
//                    "bonus": "0"
//                },
//                {
//                    "coin": "BIT",
//                    "equity": "1.82",
//                    "usdValue": "0.48758257",
//                    "walletBalance": "1.82",
//                    "availableToWithdraw": "1.82",
//                    "availableToBorrow": "0",
//                    "borrowAmount": "0",
//                    "accruedInterest": "",
//                    "totalOrderIM": "0",
//                    "totalPositionIM": "0",
//                    "totalPositionMM": "0",
//                    "unrealisedPnl": "0",
//                    "cumRealisedPnl": "0",
//                    "bonus": "0"
//                }
//            ],
//            "accountType": "UNIFIED",
//            "accountLTV": "0.017"
//        }
//    ]
//}
//https://bybit-exchange.github.io/docs/v5/websocket/private/wallet

const balance = [];
const startListenWallet = async () => {
    const getBalancesResponse = await spotApi.getWalletBalance({
        accountType: 'SPOT'
    });
    if (getBalancesResponse.retCode != 0) {
        console.log("GetBalancesResponse error: ", getBalancesResponse.retCode, getBalancesResponse.retMsg);
        return null;        
    }
    console.log("GetBalancesResponse success: ", getBalancesResponse.result.list[0].coin);
    
    getBalancesResponse.result.list[0].coin.forEach((d) => {
        balance[d.coin] = parseFloat(d.free);
    });
    
    const wsClient = new WebsocketClient({
      key: 'HEDYZXOUXECBYTYXHD',
      secret: 'SNOZZYVTAWONHPFWZLLQMBLRBIDUAZCLATEU',
      market: 'v5'
    });
    
    wsClient.on('update', (data) => {
      console.log('Wallet balance message ', JSON.stringify(data, null, 2));
      if (parseFloat(data.data[0].coin[0].locked) > 0.0) {
        console.log('Order in process. Skip message');
        return;
      }
      
      balance[data.data[0].coin[0].coin] = parseFloat(data.data[0].coin[0].walletBalance);
    });
   
    wsClient.subscribe(['wallet']);     
};

module.exports = { startListenWallet, balance };