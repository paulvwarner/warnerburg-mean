angular.module("contentAdminModule").directive("categoryDynamicStateHref", ['$state', function($state) {
    return {
        link: function (scope, element, attrs) {
            console.log("post ", scope.category);

            var stateHref = "(category:'"+scope.category+"')";
            element.on("click", function(event) {
                event.preventDefault();
                console.log("going");
                $state.go("category", {categoryId: scope.category});
            });
        }
    };
}]);