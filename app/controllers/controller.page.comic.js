var comicPageModule = angular.module("comicPageModule", ['ngSanitize', 'ngResource']);

comicPageModule.config(function($locationProvider) {
    $locationProvider.html5Mode(true);
});

comicPageModule.run(['$rootScope', 'comicService', function($rootScope, comicService) {
    $rootScope.comic = {};

    $rootScope.common = {
        mainCssUrl: '/includes/css/warnerburg.css',
        homeDark: '/images/navigation/homedarks.png',
        homeLight: '/images/navigation/homelights.png',
        galleryDark: '/images/navigation/gallerydarks.png',
        galleryLight: '/images/navigation/gallerylights.png',
        comicDark: '/images/navigation/comicdarks.png',
        comicLight: '/images/navigation/comiclights.png',
        storeDark: '/images/navigation/storedarks.png',
        storeLight: '/images/navigation/storelights.png',
        infoDark: '/images/navigation/infodarks.png',
        infoLight: '/images/navigation/infolights.png',
        linksDark: '/images/navigation/linksdarks.png',
        linksLight: '/images/navigation/linkslights.png',
        homeUrl: '/',
        galleryUrl: '/gallery',
        storeUrl: '/store',
        comicUrl: '/comic',
        archivesUrl: '/comic/archives',
        infoUrl: '/info'
    };
}]);

comicPageModule.controller("comicPageController", ['$scope', '$http', '$sce', '$rootScope', '$attrs', 'comicService',
    function ($scope, $http, $sce, $rootScope, $attrs, comicService) {
        console.log("comic controller called here  ");
        $rootScope.firstModelChangeHappened = false;

        // get current model once angular is set up for the first time, then sync model to url from then on
        comicService.getComic($attrs.comicSequenceNumber, function() {
            $rootScope.$on("$locationChangeSuccess", function() {
                comicService.syncModelToUrl();
            });
        });
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
                    console.log("bindSrcAfterFirstModelChange: ", attr.bindSrcAfterFirstModelChange);
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
                    console.log(entry);
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
                    console.log(entry);
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

comicPageModule.factory("comicService", ['$http', '$sce', '$rootScope', '$location', function ($http, $sce, $rootScope, $location) {
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
    var handleComicChange = function() {
        // scroll to top of page
        window.scrollTo(0,0);

        // update history
        $location.path($rootScope.common.comicUrl+'/'+$rootScope.comic.sequenceNumber);

        // trigger broadcast of first model change event if necessary
        broadcastFirstModelChangeIfNecessary();
    };
    var showComic = function(comicSequenceNumber) {
        getComic(comicSequenceNumber, handleComicChange);
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
    var bindAfterFirstModelChange = function(templateElement, watchVariable, getHtmlToBind) {
        templateElement.addClass('ng-binding');
        return function (scope, element, attr) {
            // start binding on event representing first change in model
            $rootScope.$on("firstModelChange", function () {
                console.log("bindafter FMC: "+watchVariable);
                scope.$watch(watchVariable, function ngBindWatchAction(value) {
                    console.log(watchVariable + ' changed to '+value);
                    console.log("element: ",element);
                    element.html(''+getHtmlToBind(value));
                });
            });
        };
    };
    // sequenceNumberToUse is a string meant to be eval'd (necessary because some include rootScope variables that
    // aren't defined at the point the callers call this, but which will exist at the point the app is ready to
    // process these clicks with JS)
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
    var syncModelToUrl = function() {
        var pathSequenceNumber = '' + getComicSequenceNumberFromPath($location.path());
        var modelSequenceNumber = '' + $rootScope.comic.sequenceNumber;
        console.log("path is '"+ pathSequenceNumber +"' and model is using '"+modelSequenceNumber+"'");

        if (pathSequenceNumber != modelSequenceNumber) {
            // we're okay if path seq num is blank but model says we're the latest comic;
            // otherwise, show the comic in the path
            if (!(pathSequenceNumber == '' && $rootScope.comic.isLast)) {
                console.log("syncing model to use path comic")
                showComic(eval("'"+pathSequenceNumber+"'"));
            }
        }

    };
    var getComicSequenceNumberFromPath = function(path) {
        return path.split('comic').join('').split('/').join('');
    };
    return {
        showComic: showComic,
        getComic: getComic,
        broadcastFirstModelChangeIfNecessary: broadcastFirstModelChangeIfNecessary,
        setHideCondition: setHideCondition,
        bindAfterFirstModelChange: bindAfterFirstModelChange,
        setComicNavOnClickHandler: setComicNavOnClickHandler,
        setHideConditionOnFirstModelChange: setHideConditionOnFirstModelChange,
        syncModelToUrl: syncModelToUrl,
        getComicSequenceNumberFromPath: getComicSequenceNumberFromPath
    };
}]);