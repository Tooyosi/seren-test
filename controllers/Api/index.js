const { logger } = require('../../loggers/logger')

const ResponseSchema = require("../../models/responses")
const QuestionSchema = require("../../models/questions")


module.exports = {
    getreponses: async (req, res) => {
        try {
            let responses = await ResponseSchema.aggregate([
                {
                    $unwind: "$question"
                },
                {
                    $lookup:
                    {
                        from: "question",
                        localField: "question",
                        foreignField: "id",
                        as: "__"
                    }
                }
            ])

            return res.status(200).send(responses)
        } catch (error) {
            logger.error(`Failed to ferch reponse list due to ${error.toString()}`)
            return res.status(400).send("An error occured")

        }
    }
}