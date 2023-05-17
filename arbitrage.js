require('log-timestamp');
const { log, error } = console;
const got = require("got");
const Websocket = require("ws");
const { sort } = require("fast-sort");
const { promisify } = require("util");
const delay = promisify(setTimeout);

const payment = require("./payment");

let pairs = [],
  symValJ = {};

const getPairs = async () => {  
  const resp = await got("https://api.bybit.com/spot/v3/public/symbols");
  const eInfo = JSON.parse(resp.body);
  const symbols = [
    ...new Set(eInfo.result.list.map((d) => [d.baseCoin, d.quoteCoin]).flat()),
  ];
  const validPairs = eInfo.result.list.map((d) => d.name);
  
  let pairInfo = {};
  eInfo.result.list.forEach((d) => {
     pairInfo[d.name] = {
        basePrecision: d.basePrecision.split(".")[1]?.length, 
        quotePrecision: d.quotePrecision.split(".")[1]?.length,
        minTradeQty: parseFloat(d.minTradeQty), 
        minTradeAmt: parseFloat(d.minTradeAmt) 
     };
  });
  
  validPairs.forEach((symbol) => {
    symValJ[symbol] = { bidPrice: 0, askPrice: 0, bidPriceDiff: 0.0, askPriceDiff: 0.0 };
  });

  let s1 = symbols,
    s2 = symbols,
    s3 = symbols;
  s1.forEach((d1) => {
    s2.forEach((d2) => {
      s3.forEach((d3) => {
        if (!(d1 == d2 || d2 == d3 || d3 == d1)) {
          let lv1 = [],
            lv2 = [],
            lv3 = [],
            lv1BasePrecision = 0,
            lv1QuotePrecision = 0,
            lv2BasePrecision = 0,
            lv2QuotePrecision = 0,
            lv3BasePrecision = 0,
            lv3QuotePrecision = 0,
            lv1MinTradeQty = 0.0,
            lv1MinTradeAmt = 0.0,
            lv2MinTradeQty = 0.0,
            lv2MinTradeAmt = 0.0,
            lv3MinTradeQty = 0.0,
            lv3MinTradeAmt = 0.0,
            l1 = "",
            l2 = "",
            l3 = "";
          if (symValJ[d1 + d2]) {
            lv1.push(d1 + d2);
            l1 = "num";
            lv1BasePrecision = pairInfo[d1 + d2].basePrecision;
            lv1QuotePrecision = pairInfo[d1 + d2].quotePrecision;
            lv1MinTradeQty = pairInfo[d1 + d2].minTradeQty;
            lv1MinTradeAmt = pairInfo[d1 + d2].minTradeAmt;
          }
          if (symValJ[d2 + d1]) {
            lv1.push(d2 + d1);
            l1 = "den";
            lv1BasePrecision = pairInfo[d2 + d1].basePrecision;
            lv1QuotePrecision = pairInfo[d2 + d1].quotePrecision;
            lv1MinTradeQty = pairInfo[d2 + d1].minTradeQty;
            lv1MinTradeAmt = pairInfo[d2 + d1].minTradeAmt;
          }

          if (symValJ[d2 + d3]) {
            lv2.push(d2 + d3);
            l2 = "num";
            lv2BasePrecision = pairInfo[d2 + d3].basePrecision;
            lv2QuotePrecision = pairInfo[d2 + d3].quotePrecision;
            lv2MinTradeQty = pairInfo[d2 + d3].minTradeQty;
            lv2MinTradeAmt = pairInfo[d2 + d3].minTradeAmt;
          }
          if (symValJ[d3 + d2]) {
            lv2.push(d3 + d2);
            l2 = "den";
            lv2BasePrecision = pairInfo[d3 + d2].basePrecision;
            lv2QuotePrecision = pairInfo[d3 + d2].quotePrecision;
            lv2MinTradeQty = pairInfo[d3 + d2].minTradeQty;
            lv2MinTradeAmt = pairInfo[d3 + d2].minTradeAmt;
          }

          if (symValJ[d3 + d1]) {
            lv3.push(d3 + d1);
            l3 = "num";
            lv3BasePrecision = pairInfo[d3 + d1].basePrecision;
            lv3QuotePrecision = pairInfo[d3 + d1].quotePrecision;
            lv3MinTradeQty = pairInfo[d3 + d1].minTradeQty;
            lv3MinTradeAmt = pairInfo[d3 + d1].minTradeAmt;
          }
          if (symValJ[d1 + d3]) {
            lv3.push(d1 + d3);
            l3 = "den";
            lv3BasePrecision = pairInfo[d1 + d3].basePrecision;
            lv3QuotePrecision = pairInfo[d1 + d3].quotePrecision;
            lv3MinTradeQty = pairInfo[d1 + d3].minTradeQty;
            lv3MinTradeAmt = pairInfo[d1 + d3].minTradeAmt;
          }

          if (lv1.length && lv2.length && lv3.length) {
            pairs.push({
              l1: l1,
              l2: l2,
              l3: l3,
              d1: d1,
              d2: d2,
              d3: d3,
              lv1: lv1[0],
              lv2: lv2[0],
              lv3: lv3[0],
              lv1BasePrecision: lv1BasePrecision,
              lv1QuotePrecision: lv1QuotePrecision,
              lv2BasePrecision: lv2BasePrecision,
              lv2QuotePrecision: lv2QuotePrecision,
              lv3BasePrecision: lv3BasePrecision,
              lv3QuotePrecision: lv3QuotePrecision,
              lv1MinTradeQty: lv1MinTradeQty,
              lv1MinTradeAmt: lv1MinTradeAmt,
              lv2MinTradeQty: lv2MinTradeQty,
              lv2MinTradeAmt: lv2MinTradeAmt,
              lv3MinTradeQty: lv3MinTradeQty,
              lv3MinTradeAmt: lv3MinTradeAmt,
              lv1Price: "",
              lv2Price: "",
              lv3Price: "",
              value: -100,
              tpath: "",
            });
          }
        }
      });
    });
  });
  log(
    `Finished identifying all the paths. Total symbols = ${symbols.length}. Total paths = ${pairs.length}`
  );
};

const processData = (pl) => {
  try {
    pl = JSON.parse(pl);
    const symbol = pl?.topic?.slice(11);
    const { data } = pl;
    if (!data) return;
    const { bp: bidPrice, ap: askPrice } = data;
    if (!bidPrice && !askPrice) return;

    if (bidPrice)  {
        if (symValJ[symbol].bidPrice) {
            symValJ[symbol].bidPriceDiff = (symValJ[symbol].bidPrice - bidPrice * 1) / 
                ((symValJ[symbol].bidPrice + bidPrice * 1) / 2) * 100;
        }
        symValJ[symbol].bidPrice = bidPrice * 1;
    }
    if (askPrice) {
        if (symValJ[symbol].askPrice) {
            symValJ[symbol].askPriceDiff = (symValJ[symbol].askPrice - askPrice * 1) / 
                ((symValJ[symbol].askPrice + askPrice * 1) / 2) * 100;
        }
        symValJ[symbol].askPrice = askPrice * 1;        
    }

    //Perform calculation and send alerts
    pairs
      .filter((d) => {
        return (d.lv1 + d.lv2 + d.lv3).includes(symbol);
      })
      .forEach((d) => {
        //continue if price is not updated for any symbol
        if (
          symValJ[d.lv1]["bidPrice"] &&
          symValJ[d.lv2]["bidPrice"] &&
          symValJ[d.lv3]["bidPrice"]
        ) {
          //Level 1 calculation
          let lv_calc, lv_str;
          let lv1Price, lv2Price, lv3Price;
          if (d.l1 === "num") {
            lv1Price = '' + symValJ[d.lv1]["bidPrice"];
            lv_calc = symValJ[d.lv1]["bidPrice"];
            lv_str =
              d.d1 +
              "->" +
              d.lv1 +
              "['bidP']['" +
              symValJ[d.lv1]["bidPrice"] +
              "']" +
              "->" +
              d.d2 +
              "<br/>";
          } else {
            lv1Price = '' + symValJ[d.lv1]["askPrice"];
            lv_calc = 1 / symValJ[d.lv1]["askPrice"];
            lv_str =
              d.d1 +
              "->" +
              d.lv1 +
              "['askP']['" +
              symValJ[d.lv1]["askPrice"] +
              "']" +
              "->" +
              d.d2 +
              "<br/>";
          }

          //Level 2 calculation
          if (d.l2 === "num") {
            lv2Price = '' + symValJ[d.lv2]["bidPrice"];
            lv_calc *= symValJ[d.lv2]["bidPrice"];
            lv_str +=
              d.d2 +
              "->" +
              d.lv2 +
              "['bidP']['" +
              symValJ[d.lv2]["bidPrice"] +
              "']" +
              "->" +
              d.d3 +
              "<br/>";
          } else {
            lv2Price = '' + symValJ[d.lv2]["askPrice"];
            lv_calc *= 1 / symValJ[d.lv2]["askPrice"];
            lv_str +=
              d.d2 +
              "->" +
              d.lv2 +
              "['askP']['" +
              symValJ[d.lv2]["askPrice"] +
              "']" +
              "->" +
              d.d3 +
              "<br/>";
          }

          //Level 3 calculation
          if (d.l3 === "num") {
            lv3Price = '' + symValJ[d.lv3]["bidPrice"];
            lv_calc *= symValJ[d.lv3]["bidPrice"];
            lv_str +=
              d.d3 +
              "->" +
              d.lv3 +
              "['bidP']['" +
              symValJ[d.lv3]["bidPrice"] +
              "']" +
              "->" +
              d.d1;
          } else {
            lv3Price = '' + symValJ[d.lv3]["askPrice"];
            lv_calc *= 1 / symValJ[d.lv3]["askPrice"];
            lv_str +=
              d.d3 +
              "->" +
              d.lv3 +
              "['askP']['" +
              symValJ[d.lv3]["askPrice"] +
              "']" +
              "->" +
              d.d1;
          }

          d.tpath = lv_str;
          d.value = parseFloat(parseFloat((lv_calc - 1) * 100).toFixed(3));
          d.lv1Price = lv1Price;
          d.lv2Price = lv2Price;
          d.lv3Price = lv3Price;
        }
      });

        // Arbitrage search
        const bestPair = sort(pairs
                    .filter((d) => d.d1 == 'USDT')
                    .filter((d) => d.d3 == 'USDC')
                    .filter((d) => parseFloat(d.value) >= parseFloat(0.5)))
//                    .filter((d) => Math.abs(parseFloat(d.value) - parseFloat(symValJ[symbol].askPriceDiff)) <= parseFloat(0.1)))
                    .desc((u) => u.value)[0];
        if (bestPair !== undefined) {
            payment.makeArbitrage(bestPair);
        }
  } catch (err) {
    error(err);
  }
};

let ws = "";
let subs = [];
const wsconnect = () => {
  ws = new Websocket(`wss://stream.bybit.com/spot/public/v3`);

  subs = Object.keys(symValJ).map((d) => `bookticker.${d}`);
  ws.on("open", async () => {
    console.log("Establishing all the required websocket connections.");
    const chunkSize = 10;
    const argChunks = subs
      .map((d, i, arr) => (i % chunkSize ? "" : arr.slice(i, i + chunkSize)))
      .filter((d) => d);
    let ci = -1;
    do {
      ci++;
      const args = argChunks[ci];
      if (!args) break;
      await delay(1000);
      ws.send(
        JSON.stringify({
          op: "subscribe",
          args,
        })
      );
      const clen = subs.length - Math.min(subs.length, ci * chunkSize);
      console.log(`${clen} more connections to go...`);
    } while (true);
    console.log("all connections established.");
  });
  ws.on("error", log);
  ws.on("message", processData);

  setInterval(() => {
    if (!(ws.readyState === Websocket.OPEN)) return;
    ws.ping();
  }, 20 * 1000);
};

module.exports = { getPairs, wsconnect, pairs };
