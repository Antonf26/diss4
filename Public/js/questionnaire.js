//Questionnaire model

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;
	var defaultAnswers = [{
	id: integer,
	answerText: String
	}],
    var questionnaireSchema = new Schema({
        title: String,
        id: String,
        defaultAnswers: [String],
        questions: [{
        id: String,
        questionText: String,
        useDefaultAnswers: Boolean,
        customAnswers: [{
			id: integer,
			answerText: String
					}]}],
        introText: String,
        acceptanceCriteria: [String]
    });

    this.model = mongoose.model('Questionnaire', questionnaireSchema);

    return this;


}

