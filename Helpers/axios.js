const axios = require('axios')


const instance = axios.create({
    // baseURL: process.env.SLACK_API_BASE_URL
});


function setToken(config, idToken = '') {
    config.headers.common['Authorization'] = `Bearer ${idToken}`;
}

instance.interceptors.request.use(config => {

    //set interceptor token header
    setToken(config, process.env.SLACK_BOT_TOKEN);

    return config
}, error => {
    return Promise.reject(error)
});

// returns default axios config
module.exports = instance

