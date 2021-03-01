// user model
var mongoose = require("mongoose");


var OptionsSchema = new mongoose.Schema({
    option: String,
    question:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question"
        }
    ]
});



module.exports = mongoose.model("Options", OptionsSchema)