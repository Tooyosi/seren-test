const express = require("express")
const app = express()
const SlackBot = require("slackbots")
const { App } = require('@slack/bolt');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api')
const mongoose = require("mongoose")
const axios = require("axios")
require("dotenv").config()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const token = process.env.SLACK_BOT_TOKEN


var url = process.env.DB_URL;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) {
    console.lo(err)
  }
});

const ResponseSchema = require("./models/responses")
const QuestionSchema = require("./models/questions")


app.get('/seed', async (req, res) => {
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
        console.log(err)
      } else {
        i += 1
      }
    })
  })

  res.send({ i })
})

app.get('/test', (req, res) => {


  res.status(200).send("ok")
})


app.post("/interact", async (req, res) => {
  let { payload } = req.body
  payload = JSON.parse(payload)

  let questionFetch = async (param) => {
    let question = await QuestionSchema.findOne().where('code').equals(param)
    return question
  }

  let addResponse = async (data) => {
    return await ResponseSchema.create(data)
  }
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
          question: question.id
        }, async (err, createdResponse) => {
          if (err) {
            // return
            // console.log(err)
          }
          try {

            // await axios.post('https://slack.com/api/views.open',
            //   {
            //     "trigger_id": payload.trigger_id,
            //     "view": {
            //       "title": {
            //         "type": "plain_text",
            //         "text": "When are you free"
            //       },
            //       "submit": {
            //         "type": "plain_text",
            //         "text": "Submit"
            //       },
            //       "blocks": [
            //         {
            //           "type": "section",
            //           "block_id": "multi_select_block",
            //           "text": {
            //             "type": "mrkdwn",
            //             "text": "Select Time"
            //           },
            //           "accessory": {
            //             "action_id": "selected_times",
            //             "type": "multi_static_select",
            //             "max_selected_items": 2,
            //             "placeholder": {
            //               "type": "plain_text",
            //               "text": "Select items"
            //             },
            //             "options": [...timeOptions]
            //           },
            //         },
            //         {
            //           "type": "actions",
            //           "block_id": "day_select_block",
            //           "elements": [
            //             {
            //               "type": "static_select",
            //               "placeholder": {
            //                 "type": "plain_text",
            //                 "text": "Select a day",
            //                 "emoji": true
            //               },
            //               "options": dateOptions,
            //               "action_id": "selected_day"
            //             },
            //             {
            //               "action_id": "my_action_id",
            //               "type": "conversations_select",
            //               "response_url_enabled": true,
            //             }
            //           ]
            //         }
            //       ],
            //       "type": "modal"

            //     }
            //   },
            //   {
            //     headers: {
            //       Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
            //     }
            //   }
            // )

            axios.post('https://slack.com/api/dialog.open', {
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
            }, {
              headers: {
                Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
              }
            }).then((res) => {
              // console.log(res.data)
            }).catch((err) => {
              // console.log(err.response)
            })

            return res.status(200).send("")
            // return res.status(200).send({
            //   "trigger_id": payload.trigger_id,
            //   "view": {
            //     "title": {
            //       "type": "plain_text",
            //       "text": "When are you free"
            //     },
            //     "submit": {
            //       "type": "plain_text",
            //       "text": "Submit"
            //     },
            //     "blocks": [
            //       {
            //         "type": "section",
            //         "block_id": "multi_select_block",
            //         "text": {
            //           "type": "mrkdwn",
            //           "text": "Select Time"
            //         },
            //         "accessory": {
            //           "action_id": "selected_times",
            //           "type": "multi_static_select",
            //           "max_selected_items": 2,
            //           "placeholder": {
            //             "type": "plain_text",
            //             "text": "Select items"
            //           },
            //           "options": [...timeOptions]
            //         },
            //       },
            //       {
            //         "type": "actions",
            //         "block_id": "day_select_block",
            //         "elements": [
            //           {
            //             "type": "static_select",
            //             "placeholder": {
            //               "type": "plain_text",
            //               "text": "Select a day",
            //               "emoji": true
            //             },
            //             "options": dateOptions,
            //             "action_id": "selected_day"
            //           },
            //           {
            //             "action_id": "my_action_id",
            //             "type": "conversations_select",
            //             "response_url_enabled": true,
            //           }
            //         ]
            //       }
            //     ],
            //     "type": "modal"

            //   }
            // });

          } catch (error) {
            // console.log(error.response || error)
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
          question: quest.id
        })
        await axios.post("https://slack.com/api/dialog.open",
          {
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
          }, {
          headers: {
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
          }
        }).then((res) => {
          console.log(res.data)
        }).catch((err) => {
          console.log(error.response)
        });
        break;

    }
  }
  else if (payload.state === "free_for_walk" && payload.type && payload.type == "dialog_submission") {
    try {
      let question = await questionFetch("2")

      console.log("free for walk")
      let addResp = await addResponse({
        response: `${payload.submission.time}, ${payload.submission.time_2} ${payload.submission.day}`,
        username: payload.user.name,
        question: question.id
      })
      await axios.post(payload.response_url, {
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
      })

    } catch (error) {
      console.log(error.response)
    } res.status(200).send("")

    // res.status(200).send({
    //   "text": "Welcome. How are you doing?",
    //   "response_type": "in_channel",
    //   "attachments": [
    //     {
    //       "text": "Choose a response",
    //       "fallback": "Choose a response",
    //       "color": "#3AA3E3",
    //       "attachment_type": "default",
    //       "callback_id": "greeting_list",
    //       "actions": [
    //         {
    //           "name": "greeting_list",
    //           "type": "select",
    //           "options": [
    //             {
    //               "text": "Doing Well",
    //               "value": "doing_well"
    //             },
    //             {
    //               "text": "Neutral",
    //               "value": "neutral"
    //             },
    //             {
    //               "text": "Feeling Lucky",
    //               "value": "feeling_ucky"
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // })

  } else if (payload.state === "number_scale" && payload.type && payload.type == "dialog_submission") {
    try {
      let question = await questionFetch("4")

      console.log("number scale")
      let addResp = await addResponse({
        response: `${payload.submission.number_scale_res}`,
        username: payload.user.name,
        question: question.id
      })
      await axios.post(payload.response_url,
        {
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
      )

    } catch (error) {
      console.log(error.response)
    } res.status(200).send("")

    // res.status(200).send({
    //   "text": "Welcome. How are you doing?",
    //   "response_type": "in_channel",
    //   "attachments": [
    //     {
    //       "text": "Choose a response",
    //       "fallback": "Choose a response",
    //       "color": "#3AA3E3",
    //       "attachment_type": "default",
    //       "callback_id": "greeting_list",
    //       "actions": [
    //         {
    //           "name": "greeting_list",
    //           "type": "select",
    //           "options": [
    //             {
    //               "text": "Doing Well",
    //               "value": "doing_well"
    //             },
    //             {
    //               "text": "Neutral",
    //               "value": "neutral"
    //             },
    //             {
    //               "text": "Feeling Lucky",
    //               "value": "feeling_ucky"
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // })

  }
  // console.log(payload)
})

app.post('/hello', async (req, res) => {
  let question = await QuestionSchema.findOne().where('code').equals("1")
  // findOne({$where: {
  //   code: "0"
  // }})

  // console.log({question})
  // res.status(200).send({
  //   "text": "Welcome. How are you doing?",
  //   "response_type": "in_channel",
  //   "attachments": [
  //     {
  //       "text": "Choose a response",
  //       "fallback": "Choose a response",
  //       "color": "#3AA3E3",
  //       "attachment_type": "default",
  //       "callback_id": "greeting_list",
  //       "actions": [
  //         {
  //           "name": "greeting_list",
  //           "type": "select",
  //           "options": [
  //             {
  //               "text": "Doing Well",
  //               "value": "doing_well"
  //             },
  //             {
  //               "text": "Neutral",
  //               "value": "neutral"
  //             },
  //             {
  //               "text": "Feeling Lucky",
  //               "value": "feeling_ucky"
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   ]
  // })
  try {

    await axios.post(req.body.response_url, {
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
    })


  } catch (error) {
    console.log(error.response)
  }
  return res.status(200).send("")
})

app.post('/test', async (req, res) => {
  console.log("post test")
  console.log(req.body.response_url)
  let { user_name, channel_name, text } = req.body
  // res.status(200).send(`User with username ${user_name} sent ${text} from ${channel_name}`)

  await axios.post(req.body.response_url, {
    "blocks": [
      {
        "type": "actions",
        "elements": [
          {
            "type": "datepicker",
            "initial_date": "1990-04-28",
            "placeholder": {
              "type": "plain_text",
              "text": "Select a date",
              "emoji": true
            },
            "action_id": "actionId-0"
          },
          {
            "type": "datepicker",
            "initial_date": "1990-04-28",
            "placeholder": {
              "type": "plain_text",
              "text": "Select a date",
              "emoji": true
            },
            "action_id": "actionId-1"
          }
        ]
      }
    ]
  })
  // res.status(200).send({
  //   "text": "Would you like to play a game?",
  //   "response_type": "in_channel",
  //   "attachments": [
  //     {
  //       "text": "Choose a game to play",
  //       "fallback": "If you could read this message, you'd be choosing something fun to do right now.",
  //       "color": "#3AA3E3",
  //       "attachment_type": "default",
  //       "callback_id": "game_selection",
  //       "actions": [
  //         {
  //           "name": "games_list",
  //           "text": "Pick a game...",
  //           "type": "select",
  //           "options": [
  //             {
  //               "text": "Hearts",
  //               "value": "hearts"
  //             },
  //             {
  //               "text": "Bridge",
  //               "value": "bridge"
  //             },
  //             {
  //               "text": "Checkers",
  //               "value": "checkers"
  //             },
  //             {
  //               "text": "Chess",
  //               "value": "chess"
  //             },
  //             {
  //               "text": "Poker",
  //               "value": "poker"
  //             },
  //             {
  //               "text": "Falken's Maze",
  //               "value": "maze"
  //             },
  //             {
  //               "text": "Global Thermonuclear War",
  //               "value": "war"
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   ]
  // })
})
// app.post('/slack/events', (req, res) => {
//     console.log("hit")
//     res.status(200).send("Success")
// })
app.listen(process.env.PORT, () => {
  console.log(`App is running on ${process.env.PORT}`)
})

// console.log(slackApp.getMiddleware())
// app.use('/slack/events', slackApp.receiver.router)

// app.message('hello', async ({ message, say }) => {
//     // say() sends a message to the channel where the event was triggered
//     console.log("message")
//     await say(`Hey there <@${message.user}>!`);
//   });



// slackApp.message('hello', async ({ message, say }) => {
//     // say() sends a message to the channel where the event was triggered
//     await say({
//       blocks: [
//         {
//           "type": "section",
//           "text": {
//             "type": "mrkdwn",
//             "text": `Hey there <@${message.user}>!`
//           },
//           "accessory": {
//             "type": "button",
//             "text": {
//               "type": "plain_text",
//               "text": "Click Me"
//             },
//             "action_id": "button_click"
//           }
//         }
//       ],
//       text: `Hey there <@${message.user}>!`
//     });
//   });
// (async () => {
//     // Start your app
//     await slackApp.start(process.env.PORT || 3000);

//     console.log('⚡️ Bolt app is running!');
//   })();