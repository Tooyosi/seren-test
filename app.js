const express = require("express")
const app = express()
const mongoose = require("mongoose")
const axios = require("axios")
require("dotenv").config()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const token = process.env.SLACK_BOT_TOKEN

const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger/index')

var url = process.env.DB_URL;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) {
    console.log(err)
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/swagger.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

const botRoutes = require("./routes/Bots/index")
const apiRoutes = require("./routes/Api/index")

app.use('/bot', botRoutes)
app.use('/api', apiRoutes)

app.get("*", (req, res) => {
  return res.redirect("/api-docs")
})
app.listen(process.env.PORT, () => {
  console.log(`App is running on ${process.env.PORT}`)
})
