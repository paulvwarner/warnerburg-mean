var log = require("warnerburg-logging-config")();
var sectionMock = require("./mock.mongoose.section.model.js");

var mongooseMock = function() {};
mongooseMock.prototype = {};
mongooseMock.model = function(modelRequested) {
    var returnMock = {};

    if (modelRequested == 'section') {
        returnMock = sectionMock;
    } else {
        log.error("test is trying to access an unsupported mock model");
    }

    return returnMock;
};

module.exports = mongooseMock;