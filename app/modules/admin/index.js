
var di = require('mvcjs'),
    Module = di.load('core/module'),
    TestModule;

TestModule =  Module.inherit({}, {
    _construct: function TestModule_construct() {
        // do something here if you want
    }
});

module.exports = TestModule;