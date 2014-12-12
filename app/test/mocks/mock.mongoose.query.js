var queryMock = function() {};
queryMock.prototype = {};
queryMock.findOne = function() {
    return queryMock;
};
queryMock.sort = function() {
    return queryMock;
};

module.exports = queryMock;