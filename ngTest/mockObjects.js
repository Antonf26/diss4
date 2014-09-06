
exports.validSurvey = {
    _id: "TESTSURVEY",
    id: "TESTSURVEY",
    title: "testing",
    defaultAnswers: [
        {
            id: "0",
            answerText: "Strongly Disagree"
        },
        {
            id: "1",
            answerText: "Disagree"
        }
    ],
    questions: [
        {
            id: "0",
            questionText: "Huh?",
            useDefaultAnswers: true,
            customAnswers: null,
            isRequired: true
        },
        {
            id: "1",
            questionText: "Yep",
            useDefaultAnswers: false,
            customAnswers: [
                {
                    id: "0",
                    answerText: "Yes"
                },
                {
                    id: "1",
                    answerText: "No"
                }
            ],
            isRequired: true
        }
    ],
    introText: "Introductory",
    introFooter: "Footer",
    acceptanceText: "Please agree to the below to proceed",
    acceptanceCriteria: [
        {
            consentText: "I agree to take part in this study.",
            agreed: false
        }
    ],
    completionText: "Done, thanks",
    surveyHeading: "Header",
    surveyHead: "Head"
};

exports.mockAuthOnlySurvey = {};
authOnlySurvey.authenticationFields = exports.validSurvey.authenticationFields;
authOnlySurvey.introText = exports.validSurvey.introText;
authOnlySurvey.title = exports.validSurvey.title;
authOnlySurvey._id = exports.validSurvey._id;
authOnlySurvey.introFooter = exports.validSurvey.introFooter;
authOnlySurvey.requiresAuthentication = true;



