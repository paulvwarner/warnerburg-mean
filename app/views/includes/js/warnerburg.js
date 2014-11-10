// javascript functions applicable to the entire public-facing part of the site
$(document).ready(function() {
    // lighten link images if user hovers over them
    $(".warnerburg-link-image").not(".warnerburg-selected-link-image").hover(
        function() { // mouse enter
            $(this).addClass("warnerburg-link-image-hover");
        },
        function() { // mouse leave
            $(this).removeClass("warnerburg-link-image-hover");
        }
    );

    // navigate to URL in "link" attribute if user clicks a link image
    $(".warnerburg-link-image").not(".warnerburg-selected-link-image").on('click',
        function() {
            window.location.href=$(this).attr("link");
        }
    );
});