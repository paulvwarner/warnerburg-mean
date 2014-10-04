// javascript functions specific to the comic page
$(document).ready(function() {

    // if someone clicks the "comments" link...
    $("#commentsLink").on("click", function(event) {
        event.preventDefault();
        $(".comic-comment-count-container").animate({opacity:0});
        $(".comic-comments-container").slideToggle(500, function() {
            if ($(".comic-comments-container").is(":visible")) {
                // scroll to comments area
                $('html, body').animate({
                    scrollTop: $("#commentsLink").offset().top
                }, 500);
            }
        });
    });

});