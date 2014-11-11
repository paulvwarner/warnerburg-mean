// javascript functions specific to the comic page
$(document).ready(function() {

    // if someone clicks the "comments" link...
    $("#commentsLink").on("click", function(event) {
        event.preventDefault();
        if (!$(".comic-comments-container").is(":visible")) {
            $(".comic-comments-container").css("opacity", "0");
            $(".comic-comments-container").css("display", "block");
        }

        // scroll to comments area
        $('html, body').animate({
            scrollTop: $(".comic-comments-container").offset().top
        }, 100);

        $(".comic-comments-container").animate({opacity: 1});
    });

    // don't display the blog stuff until the comic image loads
    $('#comic-image').one("load", function() {
        $("#blog-post-area").css({opacity: 0, visibility: "visible"}).animate({opacity: 1}, 'slow');
    }).each(function() {
        if (this.complete) {
            $(this).load();
        }
    });
});