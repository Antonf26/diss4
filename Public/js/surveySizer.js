/**
 * Created by Anton on 28/07/2014.
 */


var setBodyMargin = function()
{
    var height = $('#surveyFooter').outerHeight();
    $('body').css('margin-bottom', height + 5);
};

//scrolls the body element to display the element with the ID provided
var scrollToElement = function(elementID) {
    var element = $('#' + elementID);
    $('body').animate(
        {
            scrollTop: element.offset().top - ($(window).height() /4) //scrolling body to the top of the element and positioning it a quarter of the viewport height away from the top
        });
};

var positionAnswers = function(){
    var answerBlocks = $('.answerBlock');

    answerBlocks.each(function(i, ab){
        var answers = $(ab).find('.answer');
        var sum = 0;
        answers.each(function(i, an)
        {
            var width = 0;
            var answerParts = $(an).children();
            answerParts.each(function(i, ap){width += $(ap).width()});

            sum += width;
        });
        if(sum < $(ab).width() - 10)
        {
            $(ab).css('flex-direction', 'row');
            $(ab).children().css('text-align', 'center');
        }
        else
        {
            $(ab).css('flex-direction', 'column');
            $(ab).children().css('text-align', 'left');
        }

    });

};
$(window).resize(setBodyMargin);
$(window).resize(positionAnswers);