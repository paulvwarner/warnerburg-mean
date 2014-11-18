angular.module("contentModule").factory("contentService", ['$http', '$sce', '$rootScope', '$location', '$window', '$q',
    function ($http, $sce, $rootScope, $location, $window, $q) {
    var createComment = function(comicSequenceNumber, comment, scope) {
        console.log("saving comment ",comment);
        $http.post('/data/comics/' + comicSequenceNumber + '/comments', {comment: comment, comicSequenceNumber:comicSequenceNumber})
            .success(function(newComment) {
                $rootScope.content.comments.push(newComment);
                scope.newComment = null;
            }).error(function(data) {
                console.log('error: ' + data);
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