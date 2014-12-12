var log = require("warnerburg-logging-config")();
var queryMock = require("../mocks/mock.mongoose.query.js");

var sectionMock = function() {};
sectionMock.prototype = {};
sectionMock.findOne = function() {
    return queryMock;
};

module.exports = sectionMock;