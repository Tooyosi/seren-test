const ApiService = require("../../Helpers/ApiAdapter")
const { logger } = require('../../loggers/logger')

const ResponseSchema = require("../../models/responses")
const QuestionSchema = require("../../models/questions")
var mongoose = require("mongoose");
const { questionFetch, addResponse } = require("../../Helpers");


let apiInstance = new ApiService()
module.exports = {
    interact: async (req, res) => {
        let dataToSend
        let { payload } = req.body
        payload = JSON.parse(payload)
        
       
        if (payload && payload.actions && payload.actions[0] && payload.actions[0].action_id) {
            switch (payload.actions[0].action_id) {
                case "greeting_list":

                    return res.status(200).send({
                        "text": "Would you like to play a game?",
                        "response_type": "in_channel",
                        "attachments": [
                            {
                                "text": "A Free time",
                                "fallback": "If you could read this message, you'd be choosing a free time",
                                "color": "#3AA3E3",
                                "attachment_type": "default",
                                "callback_id": "time_list1",
                                "actions": [
                                    {
                                        "name": "time_list1",
                                        "text": "Pick a Time",
                                        "type": "select",
                                        "options": timeOptions
                                    }
                                ]
                            }
                        ]
                    });
                    break;

                case "static_select-action":
                    let question = await questionFetch("1")

                    let timeOptions = []
                    let initialTime = 12
                    let weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                    let dateOptions = []
                    for (let i = 0; i < 7; i++) {

                        timeOptions.push(
                            {
                                "label": `${initialTime}`,
                                "value": `${initialTime}`
                            },
                            {
                                "label": `${initialTime}:30`,
                                "value": `${initialTime}:30`,
                            })


                        initialTime++
                    }

                    for (let u = 0; u < weekDays.length; u++) {
                        const element = weekDays[u];
                        dateOptions.push(
                            {
                                "label": `${element}`,
                                "value": `${element}`
                            }
                        )

                    }
                    ResponseSchema.create({
                        response: payload.actions[0].selected_option.value,
                        username: payload.user.username,
                        question: mongoose.Types.ObjectId(question._id)
                    }, async (err, createdResponse) => {
                        if (err) {
                            // return
                            // console.log(err)
                        }

                        dataToSend = {
                            "trigger_id": payload.trigger_id,
                            "dialog": {
                                "callback_id": "free_for_walk",
                                "title": "When are you free?",
                                "submit_label": "Submit",
                                "notify_on_cancel": true,
                                "state": "free_for_walk",
                                "elements": [
                                    {
                                        "label": "Choose Time",
                                        "type": "select",
                                        "name": "time",
                                        "options": [...timeOptions]
                                    },
                                    {
                                        "label": "Choose Time",
                                        "type": "select",
                                        "name": "time_2",
                                        "options": [...timeOptions]
                                    },
                                    {
                                        "label": "Choose Day",
                                        "type": "select",
                                        "name": "day",
                                        "options": [...dateOptions]
                                    }
                                ]
                            }
                        }
                        try {
                            await apiInstance.makeCall("post", `${process.env.SLACK_API_BASE_URL}/dialog.open`, dataToSend)



                        } catch (error) {
                            logger.error(`Failed to send request with data ${JSON.stringify(dataToSend)} due to ${error.toString()}`)

                        }
                    })
                    break;
                case "hobbies_block":
                    let option = payload.actions[0].selected_options
                    let quest = await questionFetch("3")
                    let promisedValue = []
                    for (let i = 0; i < option.length; i++) {
                        promisedValue.push(`${option[i].value}`);

                    }
                    let addResp = await addResponse({
                        response: promisedValue.toString(),
                        username: payload.user.name,
                        question: mongoose.Types.ObjectId(quest.id)
                    })

                    dataToSend = {
                        "trigger_id": payload.trigger_id,
                        "dialog": {
                            "callback_id": "ryde-46e2b0",
                            "title": "Number scale?",
                            "submit_label": "Request",
                            "notify_on_cancel": true,
                            "state": "number_scale",
                            "elements": [
                                {
                                    "type": "text",
                                    "label": "What are the first 3 digits on the number scale?",
                                    "name": "number_scale_res"
                                }
                            ]
                        }
                    }

                    try {
                        await apiInstance.makeCall("post", `${process.env.SLACK_API_BASE_URL}/dialog.open`, dataToSend)

                    } catch (error) {
                        logger.error(`Failed to send request with data ${JSON.stringify(dataToSend)} due to ${error.toString()}`)
                    }
                    break;

            }
        }
        else if (payload.state === "free_for_walk" && payload.type && payload.type == "dialog_submission") {
            try {


                let question = await questionFetch("2")
                let addResp = await addResponse({
                    response: `${payload.submission.time}, ${payload.submission.time_2} ${payload.submission.day}`,
                    username: payload.user.name,
                    question: mongoose.Types.ObjectId(question._id)
                })

                dataToSend = {
                    "blocks": [
                        {
                            "type": "section",
                            "block_id": "hobbies_block",
                            "text": {
                                "type": "mrkdwn",
                                "text": "What are your favorite hobbies"
                            },
                            "accessory": {
                                "action_id": "hobbies_block",
                                "type": "multi_static_select",
                                "placeholder": {
                                    "type": "plain_text",
                                    "text": "Select items"
                                },
                                "options": [
                                    {
                                        "text": {
                                            "type": "plain_text",
                                            "text": "Football"
                                        },
                                        "value": "Football"
                                    },
                                    {
                                        "text": {
                                            "type": "plain_text",
                                            "text": "Music"
                                        },
                                        "value": "Music"
                                    },
                                    {
                                        "text": {
                                            "type": "plain_text",
                                            "text": "Sleep"
                                        },
                                        "value": "Sleep"
                                    },
                                    {
                                        "text": {
                                            "type": "plain_text",
                                            "text": "Movies"
                                        },
                                        "value": "Movies"
                                    },
                                    {
                                        "text": {
                                            "type": "plain_text",
                                            "text": "Basketball"
                                        },
                                        "value": "Basketball"
                                    },
                                ]
                            }
                        }
                    ]
                }
                await apiInstance.makeCall("post", payload.response_url, dataToSend)

            } catch (error) {
                logger.error(`Failed to send request with data ${JSON.stringify(dataToSend)} due to ${error.toString()}`)

            }

        } else if (payload.state === "number_scale" && payload.type && payload.type == "dialog_submission") {
            try {
                let question = await questionFetch("4")

                let addResp = await addResponse({
                    response: `${payload.submission.number_scale_res}`,
                    username: payload.user.name,
                    question: mongoose.Types.ObjectId(question._id)
                })

                dataToSend = {
                    "blocks": [
                        {
                            "type": "section",
                            "text": {
                                "type": "plain_text",
                                "text": "Thank You",
                                "emoji": true
                            }
                        }
                    ]
                }
                await apiInstance.makeCall("post", payload.response_url, dataToSend)
            } catch (error) {
                logger.error(`Failed to send request with data ${JSON.stringify(dataToSend)} due to ${error.toString()}`)

            }


        }
        return res.status(200).send("")


    },

    initiate: async (req, res) => {
        let question = await QuestionSchema.findOne().where('code').equals("1")
        let dataToSend = {
            "blocks": [
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "plain_text",
                            "text": "Welcome. How are you doing?",
                            "emoji": true
                        }
                    ]
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "static_select",
                            "placeholder": {
                                "type": "plain_text",
                                "text": `${question.question}`,
                                "emoji": true,
                            },
                            "options": [
                                {
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Doing Well",
                                        "emoji": true
                                    },
                                    "value": "doing_well"
                                },
                                {
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Neutral",
                                        "emoji": true
                                    },
                                    "value": "neutral"
                                },
                                {
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Feeling Lucky",
                                        "emoji": true
                                    },
                                    "value": "feeling_lucky"
                                }
                            ],
                            "action_id": "static_select-action"
                        }
                    ]
                }
            ]
        }
        try {

            await apiInstance.makeCall("post", req.body.response_url, dataToSend)

            return res.status(200).send("")

        } catch (error) {
            logger.error(`Failed to send request with data ${JSON.stringify(dataToSend)} due to ${error.toString()}`)
            return res.status(400).send("An error occured")
        }

    },

    seedData: async (req, res) => {
        let questions = [
            {
                question: "Welcome. How are you doing?",
                code: 1
            }, {
                question: "when are you free this week for a walk?",
                code: 2
            }, { question: "What are your favorite hobbies", code: 3 },
            { question: "What are the first 3 digits on the number scale?", code: 4 }
        ]

        let i = 0
        await questions.forEach(question => {
            QuestionSchema.create(question, (err, created) => {
                if (err) {
                    // console.log(err)
                } else {
                    i += 1
                }
            })
        })

        res.send({ i })
    }

}