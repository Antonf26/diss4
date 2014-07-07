/**
 * Created by Anton on 26/06/2014.
 */
var SurveyResult2 = $resource('result.json',
    {respondentNumber:123, questions:[], completedDate: new Date, surveyID: 'GCOS-24'},
    {save: {method:'POST'}});

