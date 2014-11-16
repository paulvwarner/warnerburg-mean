var commonModule = angular.module("commonModule", []);

commonModule.factory("commonService", [function () {
    var getCommonData = function() {
        console.log("GIT IT ", commonData);
        return commonData;
    };

    return {
        getCommonData: getCommonData
    }
}]);