angular.module("contentModule").factory("contentService", ['$http', '$sce', '$rootScope', '$location', '$window', '$q',
    function ($http, $sce, $rootScope, $location, $window, $q) {

    var broadcastFirstModelChangeIfNecessary = function() {
        // broadcast event representing that the first model change happened if necessary
        if (!$rootScope.firstModelChangeHappened) {
            $rootScope.$broadcast("firstModelChange");
            $rootScope.firstModelChangeHappened = true;
        }
    };
    var getContent = function(sequenceNumber, category) {
        var deferred = $q.defer();

        // hide image since we're about to change it - it will reappear in the
        // code watching for a change to the image url (bindSrcAfterFirstModelChange directive)
        if ($rootScope.firstModelChangeHappened) {
            angular.element('#content-image').css('opacity', '0');
        }
        $http.get('/data/content/' + category + '/' + sequenceNumber)
            .success(function (content) {
                deferred.resolve(content);
            })
            .error(function (data) {
                log.error('error: ' + data);
                deferred.reject(data);
            });

        return deferred.promise;
    };
    var handleContentChange = function(category, updateBrowserHistory) {
        if (updateBrowserHistory) {
            log.debug("updating history: " + $location.path() + " to " + $rootScope.content.sequenceNumber);
            $location.path(eval('$rootScope.common["'+category+'"].url') + '/' + $rootScope.content.sequenceNumber);
        }
        
        // scroll to top of page
        window.scrollTo(0,0);

        hideCommentsInstant();

        // trigger broadcast of first model change event if necessary
        broadcastFirstModelChangeIfNecessary();
    };
    var changeDisplayedContent = function(category, sequenceNumber, updateBrowserHistory) {
        log.debug("changeDisplayedContent to use "+category+"/"+sequenceNumber   );
        getContent(sequenceNumber, category)
            .then(function(content) {
                // put new content data in scope
                $rootScope.content = content;
                $rootScope.content.text = $sce.trustAsHtml(content.text);

                handleContentChange(category, updateBrowserHistory);
            })
            .catch(function(err) {
                log.error("error getting content: ",err);
            });
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
    var setContentNavOnClickHandler = function(element, sequenceNumberToUse, category) {
        log.debug("sntu:"+sequenceNumberToUse);
        element.on("click", function (event) {
            event.preventDefault();
            log.debug("sntu pre:"+sequenceNumberToUse);
            log.debug("rc:"+$rootScope.content.sequenceNumber);
            var sequenceNumberString = ''+eval(sequenceNumberToUse);
            log.debug("sequenceNumberString:"+sequenceNumberString);
            // don't allow someone to try to progress past the last content item
            if (!($rootScope.content.isLast && sequenceNumberString > (''+$rootScope.content.sequenceNumber))) {
                log.debug("change");
                changeDisplayedContent(category, sequenceNumberString, true);
            }
        });
    };
    var setHideConditionOnFirstModelChange = function(element, condition) {
        $rootScope.$on("firstModelChange", function () {
            setHideCondition(element, condition);
        });
    };
    var syncModelToUrl = function(category) {
        var pathSequenceNumber = '' + getSequenceNumberFromPath(category, $location.path());
        log.debug("syncing with path "+$location.path());

        // sync if pathSequenceNumber is blank or a sequence number; otherwise navigate away
        log.debug("'"+pathSequenceNumber+"'");
        if (!(isNaN(pathSequenceNumber) && pathSequenceNumber != '')) {
            log.debug("sync causing path change only");
            var modelSequenceNumber = '' + $rootScope.content.sequenceNumber;
            log.debug("path is '"+ pathSequenceNumber +"' and model is using '"+modelSequenceNumber+"'");

            if (pathSequenceNumber != modelSequenceNumber) {
                // we're okay if path seq num is blank but model says we're the latest content item;
                // otherwise, show the content item in the path
                if (!(pathSequenceNumber == '' && $rootScope.content.isLast)) {
                    log.debug("syncing model to use path content sequence number")
                    changeDisplayedContent(category, eval("'"+pathSequenceNumber+"'"), false);
                }
            }
        } else {
            log.debug("sync causing hard redirect");
            $window.location.href = $location.path();
        }
    };
    var getSequenceNumberFromPath = function(category, path) {
        return path.split(''+$rootScope.common[category].url).join('').split('/').join('');
    };
    var createComment = function(sequenceNumber, comment, scope) {
        log.debug("saving comment ",comment);
        $http.post('/data/content/' + sequenceNumber + '/comments', {comment: comment, sequenceNumber:sequenceNumber})
            .success(function(newComment) {
                $rootScope.content.comments.push(newComment);
                scope.newComment = null;
            }).error(function(data) {
                log.error('error: ' + data);
            });
    };
    var hideComments = function() {
        var commentsContainer = angular.element(".comments-container");
        commentsContainer.animate({opacity: 0,height:'hide'}, function() {
            commentsContainer.css('display','none');
        });
    };
    var hideCommentsInstant = function() {
        angular.element(".comments-container").css('display','none');
    };
    var showComments = function() {
        var commentsContainer = angular.element(".comments-container");
        commentsContainer.css("opacity", "0");
        commentsContainer.css("display", "block");

        // scroll to comments area
        angular.element('html, body').animate({
            scrollTop: commentsContainer.offset().top
        }, 100);

        commentsContainer.animate({opacity: 1});
    };
    var toggleCommentsDisplay = function() {
        var commentsContainer = angular.element(".comments-container");
        if (commentsContainer.is(":visible")) {
            hideComments();
        } else {
            showComments();
        }
    };
    return {
        getContent: getContent,
        broadcastFirstModelChangeIfNecessary: broadcastFirstModelChangeIfNecessary,
        setHideCondition: setHideCondition,
        bindAfterFirstModelChange: bindAfterFirstModelChange,
        setContentNavOnClickHandler: setContentNavOnClickHandler,
        setHideConditionOnFirstModelChange: setHideConditionOnFirstModelChange,
        syncModelToUrl: syncModelToUrl,
        createComment: createComment,
        toggleCommentsDisplay: toggleCommentsDisplay
    };
}]);