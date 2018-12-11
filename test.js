var request = require("request");

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
            console.log(body);
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(body));
            }
        });
    });
}

requestData('https://theunderminejournal.com/api/item.php?house=95&item=152512');