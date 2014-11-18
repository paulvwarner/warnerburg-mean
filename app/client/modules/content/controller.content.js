var contentModule = angular.module("contentModule", ['ngSanitize', 'ngResource', 'commonModule']);

contentModule.config(function($locationProvider) {
    $locationProvider.html5Mode(true);
});

contentModule.run(['$rootScope', 'contentService', 'commonService', function($rootScope, contentService, commonService) {
    $rootScope.comic = {};
    $rootScope.comments = [];
    $rootScope.newComment = null;

    $rootScope.common = commonService.getCommonData();
}]);

contentModule.controller("contentController", ['$scope', '$http', '$sce', '$rootScope', '$attrs', 'contentService',
    function ($scope, $http, $sce, $rootScope, $attrs, contentService) {
        console.log("content controller constructor called");
        $rootScope.firstModelChangeHappened = false;

        // get current model once angular is set up for the first time, then sync model to url from then on
        contentService.getContent($attrs.contentSequenceNumber, $attrs.contentCategory, function() {
            $rootScope.$on("$locationChangeSuccess", function() {
                contentService.syncModelToUrl();
            });
        });

        // expose function allowing users to create a new comment
        $rootScope.createComment = function(comicSequenceNumber, comment) {
            contentService.createComment(comicSequenceNumber, comment, $scope);
        };
    }]);

contentModule.directive("firstComicLink", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        link: function (scope, element, attrs) {
            contentService.setComicNavOnClickHandler(element, '1');
            contentService.setHideConditionOnFirstModelChange(element, 'comic.isFirst');
        }
    };
}]);

contentModule.directive("previousComicLink", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        link: function (scope, element, attrs) {
            contentService.setComicNavOnClickHandler(element, '$rootScope.comic.sequenceNumber - 1');
            contentService.setHideConditionOnFirstModelChange(element, 'comic.isFirst');
        }
    };
}]);

contentModule.directive("nextComicLink", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        link: function (scope, element, attrs) {
            contentService.setComicNavOnClickHandler(element, '$rootScope.comic.sequenceNumber + 1');
            contentService.setHideConditionOnFirstModelChange(element, 'comic.isLast');
        }
    };
}]);

contentModule.directive("nextComicLinkNoHide", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        link: function (scope, element, attrs) {
            contentService.setComicNavOnClickHandler(element, '$rootScope.comic.sequenceNumber + 1');
        }
    };
}]);

contentModule.directive("lastComicLink", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        link: function (scope, element, attrs) {
            contentService.setComicNavOnClickHandler(element, "''");
            contentService.setHideConditionOnFirstModelChange(element, 'comic.isLast');
        }
    };
}]);

contentModule.directive("bindSrcAfterFirstModelChange", ['$rootScope', function ($rootScope) {
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

contentModule.directive("bindContentTextAfterFirstModelChange", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        compile: function (templateElement) {
            return contentService.bindAfterFirstModelChange(templateElement, 'comic.text', function(value) {
                return value;
            });
        }
    };
}]);

contentModule.directive("displayComicSequenceNumber", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        compile: function (templateElement) {
            return contentService.bindAfterFirstModelChange(templateElement, 'comic.sequenceNumberElements', function(value) {
                newSequenceNumberHtml = '';
                value.forEach(function(entry) {
                    newSequenceNumberHtml = newSequenceNumberHtml + '<img src="/images/details/labels/'+entry+'.jpg">';
                });
                return newSequenceNumberHtml;
            });
        }
    };
}]);

contentModule.directive("displayComicCreatedDate", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        compile: function (templateElement) {
            return contentService.bindAfterFirstModelChange(templateElement, 'comic.createdDateElements', function(value) {
                newSequenceNumberHtml = '';
                value.forEach(function(entry) {
                    newSequenceNumberHtml = newSequenceNumberHtml + '<img src="/images/details/labels/'+entry+'.jpg">';
                });
                return newSequenceNumberHtml;
            });
        }
    };
}]);

contentModule.directive("displayIfLastComic", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        link: function (scope, element, attrs) {
            $rootScope.$on("firstModelChange", function () {
                contentService.setHideCondition(element, '!comic.isLast');
            });
        }
    };
}]);

// fade in when dom is ready
contentModule.directive("showWhenDocumentIsReady", ['$document', function($document) {
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
contentModule.directive("commentsLink", ['$document', '$rootScope', 'contentService', function($document, $rootScope, contentService) {
    return {
        restrict: 'A',
        link : function (scope, element, attrs) {
            $document.ready(function () {
                element.on("click", function (event) {
                    event.preventDefault();
                    contentService.toggleCommentsDisplay();
                });
            });
        }
    };
}]);

