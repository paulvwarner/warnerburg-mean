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

        // expose function allowing users to create a new comment
        $rootScope.createComment = function(comicSequenceNumber, comment) {
            comicService.createComic(comicSequenceNumber, comment);
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

comicPageModule.directive("nextComicLinkNoHide", ['$rootScope', 'comicService', function ($rootScope, comicService) {
    return {
        link: function (scope, element, attrs) {
            comicService.setComicNavOnClickHandler(element, '$rootScope.comic.sequenceNumber + 1');
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
                        element.attr('src', value).load(function() {
                            element.animate({opacity: 1},50);
                        });
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

// fade in when dom is ready
comicPageModule.directive("showWhenDocumentIsReady", ['$document', function($document) {
    return {
        restrict: 'A',
        link : function (scope, element, attrs) {
            $document.ready(function () {
                element.css({opacity: 0, visibility:'visible'}).animate({opacity: 1});
            });
        }
    };
}]);

// clicking this element should toggle the display of of the comments section
comicPageModule.directive("commentsLink", ['$document', '$rootScope', 'comicService', function($document, $rootScope, comicService) {
    return {
        restrict: 'A',
        link : function (scope, element, attrs) {
            $document.ready(function () {
                element.on("click", function (event) {
                    event.preventDefault();
                    comicService.toggleCommentsDisplay();
                });
            });
        }
    };
}]);

