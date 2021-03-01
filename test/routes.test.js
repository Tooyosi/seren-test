const request = require('supertest')
const app = require('../app')
const { questionFetch, addResponse } = require('../Helpers')


describe('Bot Endpoints', () => {
    // it('should seed the questions db', async () => {
    //     const res = await request(app)
    //         .get('/bot/seed')
    //     expect(res.statusCode).toEqual(200)
    // })

    let question

    it('should fetch question by code', async () => {
        let expectedObj = {
            "question": "Welcome. How are you doing?",
            "code": "1",
            "__v": 0
        }
        question = await questionFetch("1")
        expect(question).toMatchObject(expectedObj)
    })

    it('should add a response to the db', async () => {
        let expectedObj = {
            response: 'Mocked',
            username: 'mocked',
            question: question._id,
        }
        expect(await addResponse({
            response: "Mocked",
            username: "mocked",
            question: question._id
        })).toMatchObject(expectedObj)
    })

 
    it('should send fail sending bot response', async () => {
        const res = await request(app)
            .post('/bot/initiate')
            .send({
                response_url: "test"
            })
        expect(res.statusCode).toEqual(400)
    })

    it("Send an interactive essage and receive a success", async()=>{
        let payload = '{"type":"block_actions","user":{"id":"U01PJLBK5K3","username":"tuc0476","name":"tuc0476","team_id":"T01PC6SA19S"},"api_app_id":"A01NRFY89L7","token":"YDofJlvFUaQ9gDIkyp4u8Fz8","container":{"type":"message","message_ts":"1614588871.002400","channel_id":"C01NR8JHUF9","is_ephemeral":true},"trigger_id":"1828792091792.1794230341332.1f3bef7f43f028055510b2efc7ec1f01","team":{"id":"T01PC6SA19S","domain":"test-y6e1810"},"enterprise":null,"is_enterprise_install":false,"channel":{"id":"C01NR8JHUF9","name":"general"},"state":{"values":{"tCm":{"static_select-action":{"type":"static_select","selected_option":{"text":{"type":"plain_text","text":"Neutral","emoji":true},"value":"neutral"}}}}},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T01PC6SA19S\\/1805168962707\\/RLrMp8792sJIZG5FQjlJJ0e3","actions":[{"type":"static_select","action_id":"static_select-action","block_id":"tCm","selected_option":{"text":{"type":"plain_text","text":"Neutral","emoji":true},"value":"neutral"},"placeholder":{"type":"plain_text","text":"Welcome. How are you doing?","emoji":true},"action_ts":"1614588875.878673"}]}'
        const res = await request(app)
            .post('/bot/interact')
            .send({
                payload: payload
            })
        expect(res.statusCode).toEqual(200)
    })
})

describe("", ()=>{
  
})