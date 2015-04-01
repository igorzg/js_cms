"use strict";
var cluster, numCPUs, i;

if (process.env.NODE_ENV !== 'development') {
    cluster = require('cluster');
    numCPUs = require('os').cpus().length;

    if (cluster.isMaster) {
        // Fork workers.
        for (i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
    } else {
        bootstrap();
    }
} else {
    bootstrap();
}

/**
 * Bootstrap
 */
function bootstrap() {
    var di = require('mvcjs');
    var framework = di.load('bootstrap');
    framework.setBasePath(__dirname);

    di.setAlias('envShared', __dirname + '/env/shared/');

    process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

    framework.init('app/', '../env/' + process.env.NODE_ENV + '/env.json');
}