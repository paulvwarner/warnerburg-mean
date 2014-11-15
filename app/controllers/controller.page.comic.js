var comicPageModule = angular.module("comicPageModule", ['ngSanitize', 'ngResource']);

comicPageModule.run(['$rootScope', function($rootScope) {
    $rootScope.comic = {};
}]);

comicPageModule.controller("comicPageController", ['$scope', '$http', '$sce', '$rootScope', '$attrs', 'comicService',
    function ($scope, $http, $sce, $rootScope, $attrs, comicService) {
        console.log("comic controller called here  ");
        $rootScope.firstModelChangeHappened = false;
        comicService.showComic($attrs.comicSequenceNumber);
    }]);

comicPageModule.directive("firstComicLink", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        link: function (scope, element, attrs) {
            element.on("click", function (event) {
                event.preventDefault();
                comicService.showComic(1);
                comicService.broadcastFirstModelChangeIfNecessary();
            });

            comicService.setHideCondition(element, 'comic.isFirst');
        }
    };
}]);

comicPageModule.directive("previousComicLink", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        link: function (scope, element, attrs) {
            element.on("click", function (event) {
                event.preventDefault();
                comicService.showComic($rootScope.comic.sequenceNumber - 1);
                comicService.broadcastFirstModelChangeIfNecessary();
            });

            comicService.setHideCondition(element, 'comic.isFirst');
        }
    };
}]);

comicPageModule.directive("nextComicLink", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        link: function (scope, element, attrs) {
            element.on("click", function (event) {
                event.preventDefault();
                comicService.showComic($rootScope.comic.sequenceNumber + 1);
                comicService.broadcastFirstModelChangeIfNecessary();
            });

            comicService.setHideCondition(element, 'comic.isLast');
        }
    };
}]);

comicPageModule.directive("lastComicLink", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        link: function (scope, element, attrs) {
            element.on("click", function (event) {
                event.preventDefault();
                comicService.showComic('');
                comicService.broadcastFirstModelChangeIfNecessary();
            });

            comicService.setHideCondition(element, 'comic.isLast');
        }
    };
}]);

comicPageModule.directive("bindAfterFirstChange", ['$rootScope', function ($rootScope) {
    return {
        compile: function (templateElement) {
            templateElement.addClass('ng-binding');
            return function (scope, element, attr) {
                console.log("bindafter");
                // start binding on event representing first change in model
                $rootScope.$on("firstModelChange", function () {
                    console.log("firstModelChange: ", attr.bindAfterFirstChange);
                    element.data('$binding', attr.bindAfterFirstChange);
                    scope.$watch(attr.bindAfterFirstChange, function ngBindWatchAction(value) {
                        console.log("binding");
                        element.text(value == undefined ? '' : value);
                    });
                });
            }
        }
    }
}]);

comicPageModule.factory("comicService", ['$http', '$sce', '$rootScope', function ($http, $sce, $rootScope) {
    return {
        showComic: function(comicSequenceNumber) {
            $http.get('/data/comic/' + comicSequenceNumber)
                .success(function (comic) {
                    // put new comic data in scope
                    $rootScope.comic = comic;
                    $rootScope.comic.text = $sce.trustAsHtml(comic.text);
                })
                .error(function (data) {
                    console.log('error: ' + data);
                });
        },
        broadcastFirstModelChangeIfNecessary: function() {
            // broadcast event representing that the first model change happened if necessary
            if (!$rootScope.firstModelChangeHappened) {
                $rootScope.$broadcast("firstModelChange");
                $rootScope.firstModelChangeHappened = true;
            }
        },
        setHideCondition: function (element, watchVariable) {
            $rootScope.$watch(watchVariable, function(newVal) {
                console.log(watchVariable + ' changed to '+newVal);
                if (newVal) {
                    element.hide();
                } else {
                    element.show();
                }
            });
        }
    }
}]);