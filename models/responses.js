// user model
var mongoose = require("mongoose");


var ResponsesSchema = new mongoose.Schema({
    response: String,
    username: String,
    question:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question"
        }
    ]
});



module.exports = mongoose.model("Responses", ResponsesSchema)