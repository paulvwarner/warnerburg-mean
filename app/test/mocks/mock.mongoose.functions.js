var mpromise = require("mpromise");

var mongooseFunctions = {};

mongooseFunctions.execAndFail = function() {
    var mongoosePromise = new mpromise();
    mongoosePromise.reject("error");
    return mongoosePromise;
};
mongooseFunctions.execAndSucceed = function() {
    var mongoosePromise = new mpromise();
    mongoosePromise.fulfill("result");
    return mongoosePromise;
};
mongooseFunctions.createAndFail = function(saveObject, callback) {
    callback("error")
};
mongooseFunctions.createAndSucceed = function(saveObject, callback) {
    callback(null, saveObject);
};

module.exports = mongooseFunctions;