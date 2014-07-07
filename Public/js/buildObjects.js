/**
 * Created by Anton on 24/06/2014.
 */

var GCquestions = [];
var defaultAnswers = [];

for (var i in answers)
{
    var da = new Answer(i, answers[i]);
    defaultAnswers.push(da);
}

for (var q in questions)
{
    var q = new Question(q,questions[q], true, null);
    GCquestions.push(q);
}

var agreements = [
"I confirm that I have read and understood the information sheet (version 1) for the above study. I have had the opportunity to consider the information, ask questions and have had these answered satisfactorily",
"I understand that my participation is voluntary and that I am free to withdraw at any time, without giving reason, without my medical care or legal rights being affected.",
"I agree to the study team using my anonymised questionnaire responses for the purpose of publication",
"I understand that the data collected during the study may be looked at by individuals from Cardiff University, where it is relevant to my taking part in this study",
"I agree that to take part in this study."]

var consentItems = [];

for (var ci in agreements)
{
    var cr = new ConsentRow(agreements[ci]);
    consentItems.push(cr);

}

var GCOS24Q = new Questionnaire('GCOS-24', 23, defaultAnswers, GCquestions, "bla bla bla welcome bitches", consentItems);

document.body.innerText = JSON.stringify(GCOS24Q);