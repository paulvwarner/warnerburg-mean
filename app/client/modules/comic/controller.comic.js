var comicPageModule = angular.module("comicPageModule", ['ngSanitize', 'ngResource', 'commonModule']);

comicPageModule.config(function($locationProvider) {
    $locationProvider.html5Mode(true);
});

comicPageModule.run(['$rootScope', 'comicService', 'commonService', function($rootScope, comicService, commonService) {
    $rootScope.comic = {};
    $rootScope.comments = [];
    $rootScope.newComment = null;

    $rootScope.common = commonService.getCommonData();
}]);

comicPageModule.controller("comicPageController", ['$scope', '$http', '$sce', '$rootScope', '$attrs', 'comicService',
    function ($scope, $http, $sce, $rootScope, $attrs, comicService) {
        console.log("comic controller constructor called");
        $rootScope.firstModelChangeHappened = false;

        // get current model once angular is set up for the first time, then sync model to url from then on
        comicService.getComic($attrs.comicSequenceNumber, function() {
            $rootScope.$on("$locationChangeSuccess", function() {
                comicService.syncModelToUrl();
            });
        });

        // create a new comment
        $rootScope.createComment = function(comicSequenceNumber, comment) {
            console.log("saving comment ",comment);
            $http.post('/data/comics/' + comicSequenceNumber + '/comments', {comment: comment, comicSequenceNumber:comicSequenceNumber})
                .success(function(newComment) {
                    $rootScope.comic.comments.push(newComment);
                    $scope.newComment = null;
                }).error(function(data) {
                    console.log('error: ' + data);
                });
        };
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

comicPageModule.directive("bindSrcAfterFirstModelChange", ['$rootScope', function ($rootScope) {
    return {
        compile: function (templateElement) {
            templateElement.addClass('ng-binding');
            return function (scope, element, attr) {
                // start binding on event representing first change in model
                $rootScope.$on("firstModelChange", function () {
                    element.data('$binding', attr.bindSrcAfterFirstModelChange);
                    scope.$watch(attr.bindSrcAfterFirstModelChange, function ngBindWatchAction(value) {
                        element.attr('src', value);
                    });
                });
            };
        }
    };
}]);

comicPageModule.directive("bindContentTextAfterFirstModelChange", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        compile: function (templateElement) {
            return comicService.bindAfterFirstModelChange(templateElement, 'comic.text', function(value) {
                return value;
            });
        }
    };
}]);

comicPageModule.directive("displayComicSequenceNumber", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        compile: function (templateElement) {
            return comicService.bindAfterFirstModelChange(templateElement, 'comic.sequenceNumberElements', function(value) {
                newSequenceNumberHtml = '';
                value.forEach(function(entry) {
                    newSequenceNumberHtml = newSequenceNumberHtml + '<img src="/images/details/labels/'+entry+'.jpg">';
                });
                return newSequenceNumberHtml;
            });
        }
    };
}]);

comicPageModule.directive("displayComicCreatedDate", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        compile: function (templateElement) {
            return comicService.bindAfterFirstModelChange(templateElement, 'comic.createdDateElements', function(value) {
                newSequenceNumberHtml = '';
                value.forEach(function(entry) {
                    newSequenceNumberHtml = newSequenceNumberHtml + '<img src="/images/details/labels/'+entry+'.jpg">';
                });
                return newSequenceNumberHtml;
            });
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

comicPageModule.directive("showWhenDocumentIsReady", ['$document', function($document) {
    // show comments link when page is done loading
    return {
        restrict: 'A',
        link : function (scope, element, attrs) {
            console.log("setting directive");
            $document.ready(function () {
                console.log("dom ready");
                element.css({opacity: 0, visibility:'visible'}).animate({opacity: 1});
            });
        }
    };
}]);