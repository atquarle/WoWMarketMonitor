var http = require('http');
var request = require("request");
var dt = require('./myfirstmodule');
var email = require('./email');

var moneliteUrl = 'https://theunderminejournal.com/api/item.php?house=95&item=152512';
var PRICE_BUY_RATIO = 0.75;
var PRICE_SELL_RATIO = 1.33;
var LOOKBACK = 10;
var HOUR = 3600000;
var data = null;
var averagePrice = 0;
var averageQuantity = 0;
var currentPrice = 0;
var currentQuantity = 0;
var state = 1;
var userDetails;

var errHandler = function(err) {
    console.log(err);
}

function getPageData() {
    str = '';
    if(state == 0) {
        str += "Monelite Ore: BUY\n\n";
    } else if(state == 1){
        str += "Monelite Ore: HOLD\n\n";
    } else {
        str += "Monelite Ore: SELL\n\n";
    }
    str += "Data:\n";
    str += "Past " + LOOKBACK + " Days Price: \t" + Math.round(averagePrice) + "\n";
    str += "Current Price: \t\t" + Math.round(currentPrice) + "\n\n";
    str += "Past " + LOOKBACK + " Days Quantity: \t" + Math.round(averageQuantity) + "\n";
    str += "Current Quantity: \t" + Math.round(currentQuantity) + "\n\n";
    str += "Ratio: \t\t" + ((currentPrice)/averagePrice);
    return str;
}

function processData(data) {
    averagePrice = 0;
    averageQuantity = 0;
    currentPrice = 0;
    currentQuantity = 0;
    var l = data.daily.length;
    for(i = 0; i <= LOOKBACK; i++) {
        var obj = data.daily[l-(LOOKBACK-i)-1];
        averagePrice += obj.silveravg;
        averageQuantity += obj.quantityavg;
    }
    averagePrice /= LOOKBACK;
    averageQuantity /= LOOKBACK;
    currentPrice = data.stats[0].price/100;
    currentQuantity = data.stats[0].quantity;
    var ratio = (currentPrice)/averagePrice;
    if(ratio <= PRICE_BUY_RATIO) {
        if(state != 0) {
            state = 0;
            email.notify("Buy Monelite Ore Now!");
        }
    } else if(ratio >= PRICE_SELL_RATIO) {
        if(state != 2) {
            state = 2;
            email.notify("Sell Monelite Ore Now!");
        }
    } else if(state != 1) {
        if(state == 0) email.notify("Stop Buying Monelite Ore!");
        else if(state == 2) email.notify("Stop Selling Monelite Ore!");
        state = 1;
    }
}

function requestData(url) {
    // Setting URL and headers for request
    var options = {
        url: url,
        headers: {
            'User-Agent': 'request'
        }
    };
    // Return new promise 
    return new Promise(function(resolve, reject) {
    	// Do async job
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(body));
            }
        });
    });
}

function startServer() {
    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(getPageData());
        res.end();
    }).listen(8080);
    console.log("Listening on localhost:8080...");
}

var dataUpdateLoop = function() {
    var promise = requestData(moneliteUrl);
    promise.then(function(result) {
        console.log("Promise Resolved: Data Recieved");
        userDetails = result;
        processData(userDetails);
    }, errHandler)
    .catch(function () {
        console.log("Promise Rejected");
    });
}

function main() {
    startServer();
    dataUpdateLoop();
    setInterval(dataUpdateLoop, HOUR*2);
}

main();