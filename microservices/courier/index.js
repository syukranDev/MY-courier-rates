const logger = require('./components/logger').logger;
// const config = require("config");
// logger.info('NODE_ENV: ' + config.util.getEnv('NODE_ENV'));
const PORT = 8902
const http = require('http');
const https = require('https');
const fs = require('fs');
const app = require('./router')

var server;

server = http.createServer(app).listen(PORT, function() {
logger.info(`Courier Microservices start at port ${PORT}`);
})


process.on('unhandledRejection', function (reason, p) {
  logger.error({
    route: 'unhandledRejection',
    reason: reason,
    p: p
  })
  throw reason;
});

function crashPeacefullyPlease() {
  logger.info({info: 'Courier Microservices Closing...'})
  server.close(() => { 
    logger.info({ info: 'Courier Microservices Closed !!! '})
    process.exit();
  })
  // Force close server after 5secs
  setTimeout((e) => {
    logger.info({info: 'Courier Microservices close !!!',e})
    process.exit();
  }, 5000);
}

process.on('uncaughtException', (err) => {
  logger.error({
    route: 'uncaughtException',
    error_message: err && err.message,
    error_stack: err && err.stack
  })
  crashPeacefullyPlease();
});

process.on('deprecation', (dep) => {
  logger.info({
    route: 'warning',
    stack: dep && dep.stack
  })
});

process.on('warning', (warning) => {
  logger.info({
    route: 'warning',
    stack: warning && warning.stack
  })
});

/**
 * Event listener for HTTP server "error" event.
 * Not sure: **testing**
 */
server.on('error', onError);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof PORT === 'string' ?
    'Pipe ' + PORT :
    'Port ' + PORT;

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    logger.error({
      route: 'onError',
      error_message: bind + ' requires elevated privileges',
    })
    crashPeacefullyPlease();
    break;
  case 'EADDRINUSE':
    logger.error({
      route: 'onError',
      error_message: bind + ' is already in use',
    })
    crashPeacefullyPlease();
    break;
  default:
    throw error;
  }
}
// politely ask a program to terminate.
process.on('SIGINT', () => {
  crashPeacefullyPlease();
})

// cause program termination.
process.on('SIGTERM', () => {
  crashPeacefullyPlease();
})
