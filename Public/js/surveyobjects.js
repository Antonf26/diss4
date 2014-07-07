/**
 * Created by Anton on 24/06/2014.
 */

function Questionnaire (title, id, defaultanswers, questions, introtext, acceptancecriteria){
    this.title = title;
    this.id = id;
    this.defaultAnswers = defaultanswers;
    this.questions = questions;
    this.introText = introtext;
    this.acceptanceCriteria = acceptancecriteria;
}


function Question (id, questionText, useDefaultAnswers, customAnswers){
    this.id = id;
    this.questionText = questionText;
    this.useDefaultAnswers = useDefaultAnswers;
    this.customAnswers = customAnswers;
}

function Answer (id, answerText){
    this.id = id;
    this.answerText = answerText;
}

function ConsentRow (text)
{
    this.consentText = text;
    this.agreed = false;
}


