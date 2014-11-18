angular.module("contentModule").factory("contentService", ['$http', '$sce', '$rootScope', '$location', '$window',
    function ($http, $sce, $rootScope, $location, $window) {
    var broadcastFirstModelChangeIfNecessary = function() {
        // broadcast event representing that the first model change happened if necessary
        if (!$rootScope.firstModelChangeHappened) {
            $rootScope.$broadcast("firstModelChange");
            $rootScope.firstModelChangeHappened = true;
        }
    };
    var getContent = function(sequenceNumber, category, callback) {
        // hide image since we're about to change it - it will reappear in the
        // code watching for a change to the image url (bindSrcAfterFirstModelChange directive)
        if ($rootScope.firstModelChangeHappened) {
            angular.element('#content-image').css('opacity', '0');
        }
        $http.get('/data/' + category + '/' + sequenceNumber)
            .success(function (content) {
                // put new comic data in scope
                $rootScope.comic = content;
                $rootScope.comic.text = $sce.trustAsHtml(content.text);

                callback();
            })
            .error(function (data) {
                console.log('error: ' + data);
            });
    };
    var handleComicChange = function() {
        // scroll to top of page
        window.scrollTo(0,0);

        hideCommentsInstant();

        // trigger broadcast of first model change event if necessary
        broadcastFirstModelChangeIfNecessary();
    };
    var handleComicNavigationChange = function() {
        // update history
        console.log("updating history! " + $location.path() + " to " + $rootScope.comic.sequenceNumber);
        $location.path($rootScope.common.comicUrl + '/' + $rootScope.comic.sequenceNumber);

        handleComicChange();
    };
    var showComic = function(comicSequenceNumber) {
        getContent(comicSequenceNumber, 'comic', handleComicChange);
    };
    var navigateToComic = function(comicSequenceNumber) {
        getContent(comicSequenceNumber, 'comic', handleComicNavigationChange);
    };
    var setHideCondition = function (element, watchVariable) {
        $rootScope.$watch(watchVariable, function(newVal) {
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
                scope.$watch(watchVariable, function ngBindWatchAction(value) {
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
            var sequenceNumberString = ''+eval(sequenceNumberToUse);

            // don't allow someone to try to progress past the last comic
            if (!($rootScope.comic.isLast && sequenceNumberString > (''+$rootScope.comic.sequenceNumber))) {
                navigateToComic(sequenceNumberString);
            }
        });
    };
    var setHideConditionOnFirstModelChange = function(element, condition) {
        $rootScope.$on("firstModelChange", function () {
            setHideCondition(element, condition);
        });
    };
    var syncModelToUrl = function() {
        var pathSequenceNumber = '' + getComicSequenceNumberFromPath($location.path());

        // sync if pathSequenceNumber is blank or a comic sequence number; otherwise navigate away
        console.log("'"+pathSequenceNumber+"'");
        if (!(isNaN(pathSequenceNumber) && pathSequenceNumber != '')) {
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
        } else {
            $window.location.href = $location.path();
        }
    };
    var getComicSequenceNumberFromPath = function(path) {
        return path.split('comic').join('').split('/').join('');
    };
    var createComment = function(comicSequenceNumber, comment, scope) {
        console.log("saving comment ",comment);
        $http.post('/data/comics/' + comicSequenceNumber + '/comments', {comment: comment, comicSequenceNumber:comicSequenceNumber})
            .success(function(newComment) {
                $rootScope.comic.comments.push(newComment);
                scope.newComment = null;
            }).error(function(data) {
                console.log('error: ' + data);
            });
    };
    var hideComments = function() {
        var commentsContainer = angular.element(".comic-comments-container");
        commentsContainer.animate({opacity: 0,height:'hide'}, function() {
            commentsContainer.css('display','none');
        });
    };
    var hideCommentsInstant = function() {
        angular.element(".comic-comments-container").css('display','none');
    };
    var showComments = function() {
        var commentsContainer = angular.element(".comic-comments-container");
        commentsContainer.css("opacity", "0");
        commentsContainer.css("display", "block");

        // scroll to comments area
        angular.element('html, body').animate({
            scrollTop: commentsContainer.offset().top
        }, 100);

        commentsContainer.animate({opacity: 1});
    };
    var toggleCommentsDisplay = function() {
        var commentsContainer = angular.element(".comic-comments-container");
        if (commentsContainer.is(":visible")) {
            hideComments();
        } else {
            showComments();
        }
    };
    return {
        showComic: showComic,
        navigateToComic: navigateToComic,
        getContent: getContent,
        broadcastFirstModelChangeIfNecessary: broadcastFirstModelChangeIfNecessary,
        setHideCondition: setHideCondition,
        bindAfterFirstModelChange: bindAfterFirstModelChange,
        setComicNavOnClickHandler: setComicNavOnClickHandler,
        setHideConditionOnFirstModelChange: setHideConditionOnFirstModelChange,
        syncModelToUrl: syncModelToUrl,
        getComicSequenceNumberFromPath: getComicSequenceNumberFromPath,
        createComment: createComment,
        toggleCommentsDisplay: toggleCommentsDisplay
    };
}]);