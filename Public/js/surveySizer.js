/**
 * Created by Anton on 28/07/2014.
 */


var setBodyMargin = function()
{
    var height = $('#surveyFooter').outerHeight();
    $('body').css('margin-bottom', height + 5);
};
$(window).resize(setBodyMargin);


var scrollToElement = function(elementID) {
    var element = $('#' + elementID);
    $('body').animate(
        {
            scrollTop: element.offset().top - 15
        });
};