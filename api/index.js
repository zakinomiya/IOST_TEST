"use strict";
const log4js = require("log4js");
log4js.configure({
    appenders: {
        out: { type: "stdout" }
    },
    categories: {
        default: { appenders: ["out"], level: "info" }
    }
});
const logger = log4js.getLogger("TEST");
const express = require("express");
const http = require("http");
const app = express();
const IOST = require("iost");
const iost = new IOST.IOST({
  gasRatio: 1,
  gasLimit: 4000000,
  delay: 0,
  expiration: 90,
  defaultLimit: 'unlimited',
});
const bodyParser = require('body-parser');
const bs58 = IOST.Bs58;
const rpc = new IOST.RPC(new IOST.HTTPProvider('http://test-node:30001'));
const CONTRACTID = process.env.CONTRACTID;

const host = "localhost";
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

const server = http.createServer(app).listen(port, function () {
    if (!process.env.CONTRACTID) throw new Error("No ContractID found");
});
logger.info("****************** SERVER STARTED ************************");
logger.info(
    "***************  Listening on: http://%s:%s  ******************",
    host,
    port
);
server.timeout = 240000;

const awaitHandler = fn => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            next(err);
        }
    };
};



// MapPutを繰り返す
app.post(
    "/api/map_put",
    awaitHandler(async (req, res) => {
        const { iterTime } = req.body;
        console.log(iterTime);

        const result = await f(iterTime, 'iterMapPut');

        res.send(result);
    }));


// Putを繰り返す
app.post(
    "/api/put",
    awaitHandler(async (req, res) => {
        const { iterTime } = req.body;

        const result = await f(iterTime, 'iterPut')
            .catch(err => {
                throw err;
            })

        res.send(result);
    }));




const f = async(iterTime, funcName) => {

    const iost = await c();
    const transaction = iost.callABI(
        CONTRACTID,
        funcName,
        [
            JSON.stringify(iterTime)
        ]);

    transaction.setChainID(1024);

    const promise = () =>
        new Promise((resolve, reject) => {
            logger.info('Iteration Times is ', iterTime);
            const start = process.hrtime();

            iost
                .signAndSend(transaction)
                .on("success", res => {
                    logger.info('Transaction Succeeded');
                    logger.info(`Excution time was ${process.hrtime(start)[1] / 10000}ms `);
                    logger.info(`Gas Usage was ${res.gas_usage}`)
                    logger.info(`Ram Usage was`,  res.ram_usage)
                    return resolve(res);
                })
                .on("failed", err => {
                    logger.info('Transaction Failed');
                    logger.info(`Excution time was ${process.hrtime(start)[1] / 10000}ms `)
                    return reject(err);
                });
        });

    return await promise();
}


const c = () => {
    const account = new IOST.Account("admin");
    const kp = new IOST.KeyPair(bs58.decode(process.env.ADMINKEY));

    account.addKeyPair(kp, "owner");
    account.addKeyPair(kp, "active");

    iost.setAccount(account);
    iost.setRPC(rpc);
    return iost;
};

app.use(function (error, req, res, next) {
	console.log(error);
	res.status(500);
	res.send(error);
});
