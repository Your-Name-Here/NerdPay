//** @class Blockchain */
const Path = require('path');
const EventEmitter = require('events');
const WebSocket = require('ws');
const fetch = require('node-fetch');
const Database = require(Path.resolve('Core/Modules/Database'));
 
// @ts-ignore
class Blockchain extends EventEmitter {
    constructor() {
        super();
        const DB = new Database({
            // Database connection info
            db: 'NerdPay'
        });
        
        // Connect to blockchain websocket and subscribe to all events;
        this.ws = new WebSocket('wss://ws.blockchain.info/inv');
        DB.connect().then(() => {
            DB.getSetting('master_wallet_address')
                .then((pass) => {
                    this.masterWallet = pass[0].value;
                    DB.close();
                });
        });
        this.ws.on('open', () => {
            this.watchAddress(this.masterWallet);
        });
           
        this.ws.on('message', (data) => {
            try {
                // @ts-ignore
                var parsed = JSON.parse(data);
                parsed.x.out.forEach(elem => {
                    if (elem.addr === this.masterWallet) {
                        var value = elem.value/10000000;
                        console.log(`Payment recieved: ${value}`);
                    } 
                });
            } catch (e) { console.log(`Error: ${e.message}`) }
        });
        this.ws.on('error', (data) => {
            console.log(data);
        });
    }
    getBTCPrice() {
        return new Promise((success, reject) => { 
            // @ts-ignore
            fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot')
            .then(res => res.json())
                .then(json => {
                    success(json.data.amount);
                });
        })

    }
    watchAddress(address) {
        this.ws.send(`{ "op": "addr_sub", "addr": "${address}" }`);
    }
}

module.exports = Blockchain;