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


const botRoutes = require("./routes/Bots/index")

app.use('/bot', botRoutes)

app.listen(process.env.PORT, () => {
  console.log(`App is running on ${process.env.PORT}`)
})
