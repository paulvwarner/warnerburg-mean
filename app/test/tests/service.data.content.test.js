var log = require("warnerburg-logging-config")();
var proxyquire = require("proxyquire");
var chai = require("chai");
var assert = chai.assert;
var sectionMock = require("../mocks/mock.mongoose.section.model.js");
var queryMock = require("../mocks/mock.mongoose.query.js");
var mongooseMock = require("../mocks/mock.mongoose.js");
var mongooseMockFunctions = require("../mocks/mock.mongoose.functions.js");

// create test content data service object and replace some of its dependencies
var contentDataService = proxyquire("../../server/services/service.data.content.js",
    {
        'mongoose': mongooseMock,
        'log': log
    }
);

describe("addSection", function() {
    it("should fail if there's an error finding a sequence number to use", function() {
        queryMock.exec = mongooseMockFunctions.execAndFail;
        sectionMock.create = mongooseMockFunctions.createAndSucceed;

        return contentDataService.addSection('comic', {})
            .then(function(result) {
                // test fails
                assert.fail();
            }, function(err) {
                // test passes
            });

    });

    it("should fail if there's an error creating the new section", function() {
        queryMock.exec = mongooseMockFunctions.execAndSucceed;
        sectionMock.create = mongooseMockFunctions.createAndFail;

        return contentDataService.addSection('comic', {})
            .then(function(result) {
                // test fails
                assert.fail();
            }, function(err) {
                // test passes
            });

    });


    it("should succeed if sequence number retrieval and section creation both succeed", function() {
        queryMock.exec = mongooseMockFunctions.execAndSucceed;
        sectionMock.create = mongooseMockFunctions.createAndSucceed;

        return contentDataService.addSection('comic', {})
            .then(function(result) {
                // test passes
            }, function(err) {
                // test fails
                assert.fail();
            });

    });
});