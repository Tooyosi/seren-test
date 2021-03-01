const axios = require("./axios")

class ApiCallService {
    constructor(token) {
        this.headers = {
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
        }
    }

    async makeCall(method, url, data) {
        return axios({
            method: method,
            url: url,
            // headers: this.headers,
            data: data ? data : null
        })



    }
}

module.exports = ApiCallService