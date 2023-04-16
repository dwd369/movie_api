// load http and url module
const http = require('http'),
    url = require('url'),
    fs = require('fs');

// create server
http.createServer((request, response) => {
    // delcare variable for modules
    let addr = request.url,
        q = url.parse(addr,true),
        filePath = '';

    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    })

    // check if url contains documentation
    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }

    console.log(filePath);

    // check if filePath is 
    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw(err);
        }

        response.writeHead(200,{'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    })

}).listen(8080);
console.log('My first Node test server is running on Port 8080.');