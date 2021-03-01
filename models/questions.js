// user model
var mongoose = require("mongoose");


var QuestionSchema = new mongoose.Schema({
    question: String,
    code:{type: String, unique: true, required: true}

});



module.exports = mongoose.model("Question", QuestionSchema)