var comicPageModule = angular.module("comicPageModule", ['ngSanitize', 'ngResource']);

comicPageModule.run(['$rootScope', function($rootScope) {
    $rootScope.comic = {};
}]);

comicPageModule.controller("comicPageController", ['$scope', '$http', '$sce', '$rootScope', '$attrs', 'comicService',
    function ($scope, $http, $sce, $rootScope, $attrs, comicService) {
        console.log("comic controller called here  ");
        $rootScope.firstModelChangeHappened = false;
        comicService.getComic($attrs.comicSequenceNumber, angular.noop);
    }]);

comicPageModule.directive("firstComicLink", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        link: function (scope, element, attrs) {
            comicService.setComicNavOnClickHandler(element, '1');
            comicService.setHideConditionOnFirstModelChange(element, 'comic.isFirst');
        }
    };
}]);

comicPageModule.directive("previousComicLink", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        link: function (scope, element, attrs) {
            comicService.setComicNavOnClickHandler(element, '$rootScope.comic.sequenceNumber - 1');
            comicService.setHideConditionOnFirstModelChange(element, 'comic.isFirst');
        }
    };
}]);

comicPageModule.directive("nextComicLink", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        link: function (scope, element, attrs) {
            comicService.setComicNavOnClickHandler(element, '$rootScope.comic.sequenceNumber + 1');
            comicService.setHideConditionOnFirstModelChange(element, 'comic.isLast');
        }
    };
}]);

comicPageModule.directive("lastComicLink", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        link: function (scope, element, attrs) {
            comicService.setComicNavOnClickHandler(element, "''");
            comicService.setHideConditionOnFirstModelChange(element, 'comic.isLast');
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
    };
}]);



comicPageModule.directive("displayComicSequenceNumber", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        compile: function (templateElement) {
            return comicService.bindAfterFirstModelChange(templateElement);
        }
    };
}]);

comicPageModule.directive("displayComicPublishDate", ['$rootScope', function ($rootScope) {
    return {
        compile: function (templateElement) {
            templateElement.addClass('ng-binding');
            return function (scope, element, attr) {
                // start binding on event representing first change in model
                $rootScope.$on("firstModelChange", function () {
                    console.log("displayComicSequenceNumber: ");
                    element.data('$binding', attr.bindAfterFirstChange);
                    scope.$watch('comic.sequenceNumberElements', function ngBindWatchAction(value) {
                        newSequenceNumberHtml = '';
                        value.forEach(function(entry) {
                            console.log(entry);
                            newSequenceNumberHtml = newSequenceNumberHtml + '<img src="/images/details/labels/'+entry+'.jpg">';
                        });
                        element.html(newSequenceNumberHtml);
                    });
                });
            }
        }
    };
}]);

comicPageModule.directive("displayIfLastComic", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        link: function (scope, element, attrs) {
            $rootScope.$on("firstModelChange", function () {
                comicService.setHideCondition(element, '!comic.isLast');
            });
        }
    };
}]);

comicPageModule.factory("comicService", ['$http', '$sce', '$rootScope', function ($http, $sce, $rootScope) {
    var broadcastFirstModelChangeIfNecessary = function() {
        // broadcast event representing that the first model change happened if necessary
        if (!$rootScope.firstModelChangeHappened) {
            $rootScope.$broadcast("firstModelChange");
            $rootScope.firstModelChangeHappened = true;
        }
    };
    var getComic = function(comicSequenceNumber, callback) {
        $http.get('/data/comic/' + comicSequenceNumber)
            .success(function (comic) {
                // put new comic data in scope
                $rootScope.comic = comic;
                $rootScope.comic.text = $sce.trustAsHtml(comic.text);

                callback();
            })
            .error(function (data) {
                console.log('error: ' + data);
            });
    };
    var showComic = function(comicSequenceNumber) {
        getComic(comicSequenceNumber, broadcastFirstModelChangeIfNecessary);
    };
    var setHideCondition = function (element, watchVariable) {
        $rootScope.$watch(watchVariable, function(newVal) {
            console.log(watchVariable + ' changed to '+newVal);
            if (newVal) {
                element.hide();
            } else {
                element.show();
            }
        });
    };
    var bindAfterFirstModelChange = function(templateElement) {
        templateElement.addClass('ng-binding');
        return function (scope, element, attr) {
            // start binding on event representing first change in model
            $rootScope.$on("firstModelChange", function () {
                console.log("displayComicSequenceNumber: ");
                element.data('$binding', attr.bindAfterFirstChange);
                scope.$watch('comic.sequenceNumberElements', function ngBindWatchAction(value) {
                    newSequenceNumberHtml = '';
                    value.forEach(function(entry) {
                        console.log(entry);
                        newSequenceNumberHtml = newSequenceNumberHtml + '<img src="/images/details/labels/'+entry+'.jpg">';
                    });
                    element.html(newSequenceNumberHtml);
                });
            });
        }
    };
    var setComicNavOnClickHandler = function(element, sequenceNumberToUse) {
        element.on("click", function (event) {
            event.preventDefault();
            showComic(eval(sequenceNumberToUse));
        });
    };
    var setHideConditionOnFirstModelChange = function(element, condition) {
        $rootScope.$on("firstModelChange", function () {
            setHideCondition(element, condition);
        });
    };
    return {
        showComic: showComic,
        getComic: getComic,
        broadcastFirstModelChangeIfNecessary: broadcastFirstModelChangeIfNecessary,
        setHideCondition: setHideCondition,
        bindAfterFirstModelChange: bindAfterFirstModelChange,
        setComicNavOnClickHandler: setComicNavOnClickHandler,
        setHideConditionOnFirstModelChange: setHideConditionOnFirstModelChange
    };
}]);