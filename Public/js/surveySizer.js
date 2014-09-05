/**
 * Created by Anton on 28/07/2014.
 */

//Ensuring the footer is visible - setting the body margin to reflect its height
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

//Function positions answers either horizontally or vertically
var positionAnswers = function(){
    var answerBlocks = $('.answerBlock');
    //For each question's set of answered
    answerBlocks.each(function(i, ab){
        var answers = $(ab).find('.answer');
        var sum = 0;

        //Get the total width of answer elements (radiobutton/checkbox + text + spacing)
        answers.each(function(i, an)
        {
            var width = 0;
            var answerParts = $(an).children();
            answerParts.each(function(i, ap){width += $(ap).width()});
            sum += width;
        });

        //If all the answers fit horizontally, display them in a row
        if(sum < $(ab).width() - 10)
        {
            $(ab).css('flex-direction', 'row');
            $(ab).children().css('text-align', 'center');
        }
        //If not, display them in a column
        else
        {
            $(ab).css('flex-direction', 'column');
            $(ab).children().css('text-align', 'left');
        }

    });

};
$(window).resize(setBodyMargin);
$(window).resize(positionAnswers);