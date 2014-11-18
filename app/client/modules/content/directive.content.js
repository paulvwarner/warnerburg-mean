
angular.module("contentModule").directive("firstLink", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        link: function (scope, element, attrs) {
            contentService.setContentNavOnClickHandler(element, '1', attrs.contentCategory);
            contentService.setHideConditionOnFirstModelChange(element, 'content.isFirst');
        }
    };
}]);

angular.module("contentModule").directive("previousLink", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        link: function (scope, element, attrs) {
            contentService.setContentNavOnClickHandler(element, '$rootScope.content.sequenceNumber - 1', attrs.contentCategory);
            contentService.setHideConditionOnFirstModelChange(element, 'content.isFirst');
        }
    };
}]);

angular.module("contentModule").directive("nextLink", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        link: function (scope, element, attrs) {
            contentService.setContentNavOnClickHandler(element, '$rootScope.content.sequenceNumber + 1', attrs.contentCategory);
            contentService.setHideConditionOnFirstModelChange(element, 'content.isLast');
        }
    };
}]);

angular.module("contentModule").directive("nextLinkNoHide", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        link: function (scope, element, attrs) {
            contentService.setContentNavOnClickHandler(element, '$rootScope.content.sequenceNumber + 1', attrs.contentCategory);
        }
    };
}]);

angular.module("contentModule").directive("lastLink", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        link: function (scope, element, attrs) {
            contentService.setContentNavOnClickHandler(element, "''", attrs.contentCategory);
            contentService.setHideConditionOnFirstModelChange(element, 'content.isLast');
        }
    };
}]);

angular.module("contentModule").directive("bindSrcAfterFirstModelChange", ['$rootScope', function ($rootScope) {
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

angular.module("contentModule").directive("bindContentTextAfterFirstModelChange", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        compile: function (templateElement) {
            return contentService.bindAfterFirstModelChange(templateElement, 'content.text', function(value) {
                return value;
            });
        }
    };
}]);

angular.module("contentModule").directive("displaySequenceNumber", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        compile: function (templateElement) {
            return contentService.bindAfterFirstModelChange(templateElement, 'content.sequenceNumberElements', function(value) {
                newSequenceNumberHtml = '';
                value.forEach(function(entry) {
                    newSequenceNumberHtml = newSequenceNumberHtml + '<img src="/images/details/labels/'+entry+'.jpg">';
                });
                return newSequenceNumberHtml;
            });
        }
    };
}]);

angular.module("contentModule").directive("displayCreatedDate", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        compile: function (templateElement) {
            return contentService.bindAfterFirstModelChange(templateElement, 'content.createdDateElements', function(value) {
                newSequenceNumberHtml = '';
                value.forEach(function(entry) {
                    newSequenceNumberHtml = newSequenceNumberHtml + '<img src="/images/details/labels/'+entry+'.jpg">';
                });
                return newSequenceNumberHtml;
            });
        }
    };
}]);

angular.module("contentModule").directive("displayIfLast", ['$rootScope', 'contentService', function ($rootScope, contentService) {
    return {
        link: function (scope, element, attrs) {
            $rootScope.$on("firstModelChange", function () {
                contentService.setHideCondition(element, '!content.isLast');
            });
        }
    };
}]);

// fade in when dom is ready
angular.module("contentModule").directive("showWhenDocumentIsReady", ['$document', function($document) {
    return {
        restrict: 'A',
        link : function (scope, element, attrs) {
            $document.ready(function () {
                element.css({opacity: 0, visibility:'visible'}).animate({opacity: 1});
            });
        }
    };
}]);
