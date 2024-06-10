// Created node.js server that serves HTML files
// Imported required core modules such as http for creating http server
// fs for the file system, and path for handling file path
// Events for creating and handling events
// Imported the logger
//imported getNews, getWeather, and getMovies
const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const logger = require('./logger');
const { getNews, getWeather, getMovies } = require('./news');

// Defining an EventEmitter class
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// Capture the common HTTP status codes and write a message to the console
myEmitter.on('statusCode', (statusCode) => {
    console.log(`HTTP Status Code: ${statusCode}`);
});

// Capture only the warnings and errors and write a message to the console
myEmitter.on('warning', (message) => {
    console.log(`Warning: ${message}`);
});

myEmitter.on('error', (message) => {
    console.log(`Error: ${message}`);
});

// Every time a specific route was accessed and write a message to the console
myEmitter.on('routeAccessed', (route) => {
    console.log(`Route accessed: ${route}`);
});

// For every route that is not the home and write a message to the console
myEmitter.on('nonHomeRoute', (route) => {
    console.log(`Non-home route accessed: ${route}`);
});

// Every time a file was successfully read and write a message to the console
myEmitter.on('fileRead', (message) => {
    console.log(`File read: ${message}`);
});

// Every time a file is not available and write a message to the console
myEmitter.on('fileNotFound', (message) => {
    console.log(`File not found: ${message}`);
});

// Create the HTTP server using http.createServer() method that
// Handling incoming requests and execute callback function for each request and response
const server = http.createServer(async (req, res) => {
    // Logging the requested URL to console
    console.log(`Request URL: ${req.url}`);

    // Switch method is used to determine the action based on the route requested
    // If the URL matches any of the cases the corresponding HTML is served using the serveFile()
    // But if the URL does not match any of the cases a 404 Not Found response is sent.
    //Added case to handle daily route
    switch (req.url) {
        case '/about':
            serveFile(res, 'about.html', 'text/html', req.url);
            break;
        case '/contact':
            serveFile(res, 'contact.html', 'text/html', req.url);
            break;
        case '/products':
            serveFile(res, 'products.html', 'text/html', req.url);
            break;
        case '/subscribe':
            serveFile(res, 'subscribe.html', 'text/html', req.url);
            break;
        case '/':
            serveFile(res, 'index.html', 'text/html', req.url);
            break;
        case '/daily':
            const news = await getNews();
            const weather = await getWeather('New York');
            const movies = await getMovies();

            const dailyData = {
                news,
                weather,
                movies
            };

            //Server renders in HTML if including html/text, otherwise as a JSON data 
            if (req.headers.accept.includes('text/html')) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write('<h1>Daily Information</h1>');
                res.write('<h2>News</h2>');
                res.write('<ul>');
                news.forEach(article => {
                    res.write(`<li>${article.title}</li>`);
                });
                res.write('</ul>');

                if (weather && weather.main) {
                    res.write('<h2>Weather</h2>');
                    res.write(`<p>City: ${weather.name}</p>`);
                    res.write(`<p>Temperature: ${weather.main.temp}°C</p>`);
                    res.write(`<p>Description: ${weather.weather[0].description}</p>`);
                } else {
                    res.write('<h2>Weather</h2>');
                    res.write('<p>Weather data not available</p>');
                }

                res.write('<h2>Popular Movies</h2>');
                res.write('<ul>');
                movies.forEach(movie => {
                    res.write(`<li>${movie.title}</li>`);
                });
                res.write('</ul>');

                res.end();
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(dailyData));
            }
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            myEmitter.emit('statusCode', 404);
            myEmitter.emit('nonHomeRoute', req.url);
            break;
    }
});

// This is the function to serve HTML files
// It uses fs.readFile() method to read the files from the views directory
// If errors occur while reading the file, error message is sent and error event is emitted using myEmitter.emit('error', ...).
// If the file is read successfully a 200 OK response is sent and a fileRead event is emitted using myEmitter.emit('fileRead', ...)
function serveFile(res, fileName, contentType, route) {
    const filePath = path.join(__dirname, 'views', fileName);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<h1>500 Internal Server Error</h1>');
            myEmitter.emit('statusCode', 500);
            myEmitter.emit('error', `Error reading file: ${fileName}`);
            myEmitter.emit('fileNotFound', `File not found: ${fileName}`);
            logger.error(`Error reading file: ${fileName}`, err); // Log error with logger
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
            myEmitter.emit('statusCode', 200);
            myEmitter.emit('routeAccessed', route);
            myEmitter.emit('fileRead', `File served: ${fileName}`);
            logger.info(`File served: ${fileName}`); // Log success with logger
        }
    });
}

// Then Listening on port 3000, a message is being logged to the console
// Log server start with logger
server.listen(3000, () => {
    console.log('Server is listening on port 3000');
    logger.info('Server is listening on port 3000');
});