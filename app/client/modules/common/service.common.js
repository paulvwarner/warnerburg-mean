var commonModule = angular.module("commonModule", []);

commonModule.factory("commonService", [function () {
    var getCommonData = function() {
        return commonData;
    };

    return {
        getCommonData: getCommonData
    }
}]);