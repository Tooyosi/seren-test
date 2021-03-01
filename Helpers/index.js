
const ResponseSchema = require("../models/responses")
const QuestionSchema = require("../models/questions")
module.exports ={
    questionFetch : async (param) => {
        let question = await QuestionSchema.findOne().where('code').equals(param)
        return question
    },

    addResponse : async (data) => {
        let response =  await ResponseSchema.create(data)
        return response
    },
}