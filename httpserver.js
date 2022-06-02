let http = require('http');
let url = require('url');

const os = require('os');
global.HOME = os.platform() === "win32" ? process.env.APPDATA : process.env.HOME;
let ethInteractor = require('./ethInteractor.js');
let checkAPI = require('./apiFunctions.js');


function processPost(request, response, callback) {
    var queryData = "";
    if (typeof callback !== 'function') return null;
    // console.log("\x1b[35m", "incoming connection");

    if (request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if (queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, { 'Content-Type': 'text/plain' }).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            request.post = queryData;
            callback();
        });

    } else {
        response.writeHead(405, { 'Content-Type': 'text/plain' });
        response.end();
    }
}


const myServer = http.createServer((request, response) => {
    if (request.method == 'POST') {
        processPost(request, response, function() {
            //handle the post request based upon the url
            //let parsedUrl = url.parse(request.url);
            //trim the leading slash

            if (request.post) {
                response.writeHead(200, "OK", { 'Content-Type': 'application/json' });

                try
                {
                    let postData = JSON.parse(request.post);
                    let command = postData.method;
                    if (command != "getinfo" && command != "getcurrency")
                        console.log("Command: " + command);


                    ethInteractor[checkAPI.APIs(command)](postData.params).then((returnData) => {
                        response.write(JSON.stringify(returnData));
                        response.end();
                    });
                } catch (e)
                {
                    response.end();

                }

            }

        });
    } else {
        response.writeHead(200, "OK", { 'Content-Type': 'application/json' });
        response.end();
    }

})

myServer.listen(8000);