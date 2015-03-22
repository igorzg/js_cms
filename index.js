var di = require('mvcjs');
var framework = di.load('bootstrap');
framework.setBasePath(__dirname);

di.setAlias('envShared', __dirname + '/env/shared/');

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

framework.init('app/', '../env/' + process.env.NODE_ENV + '/env.json');
