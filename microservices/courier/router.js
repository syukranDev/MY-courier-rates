const express = require('express')
const bodyParser = require('body-parser')

const router = express.Router()
const app = express()
const controller = require('./model/controller')
const authValidation = require('./components/authValidation')

const PORT = 3004

app.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", '*');
    response.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    response.header("Access-Control-Allow-Headers", "Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    response.header('Access-Control-Allow-Credentials', true);
    response.header('Access-Control-Max-Age', '86400');
    next();
});

app.disable("x-powered-by")

//To use req.body
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

//If payload in request has typo error
app.use((err, req, res, next) => {
    err ? res.status(400).json({ message: 'Invalid JSON'}) : next()
})

app.use('/portal/courier', router)  

router.route('/')
    .post((req, res) => {
        try {

            const axios = require('axios');
            const qs = require('querystring');
            const { JSDOM } = require('jsdom')

            const data = qs.stringify({
            '_token': 'A6UNLNxCC0nlCQkrnKS254VBvBy0xCF3yXbqp6UD',
            'shipping_rates_type': 'domestic',
            'sender_postcode': '42700',
            'receiver_postcode': '42700',
            'destination_country': 'BWN',
            'shipping_type': 'EZ',
            'weight': '10',
            'length': '1',
            'width': '1',
            'height': '1',
            'item_value': ''
            });

            const config = {
            method: 'post',
            url: 'https://www.jtexpress.my/shipping-rates',
            headers: { 
                'accept': '*/*', 
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 
                'x-requested-with': 'XMLHttpRequest', 
                'Cookie': 'XSRF-TOKEN=eyJpdiI6IlNoYkFjNDhodFN0U0NiSzdvdjhuMmc9PSIsInZhbHVlIjoiUzJxaVRWb05SQzJPWTJVazBuNWJYcG9GdFVFK2Zsc290elEvSXZKdXZVWGV1empVdkh4ZnFxYkpIOWZseEdjU2ZkbHhIM3NsM3ZoMEh3MlF4TFNNT29ET3pTQWFyeElUSEFydDBReWo4dUpld1dwaURzYmdUUWFQbWZIeFZOcEoiLCJtYWMiOiI2ZGRkNTc4MjkyOTUwYThiNGRhMmMzYzk3NzllNjA0YWM5NzJmMThkNjE4MTU4NzE2MmYxMDQ2MWM2ZTQyZThhIn0%3D; jt_express_malaysia_session=eyJpdiI6IkFtbFZaMzV0eWJzc3FVS2hnYjZnK3c9PSIsInZhbHVlIjoieGs2ZHJUcUd4bWNGV3NkeTdmR0VMTUxlaVV3OGovTEdhZGFhaGc2c3haY3FrS1BFbzVVZWs3Qlg2NnFDSzA2T3FqZUZSMzk1eU80TlBPLy9ENXBGbTdzYVhyNkFOdlloUHVpMlRaZVFCR3pZSXNCcWFkZC8zTG1pcldGc2hBMU4iLCJtYWMiOiIzZTFmZmM3ZjE3NjUyM2Y1NWU2YzhmYmI1MzQyMDJkMDkyYzU0NjM3ODgzYjNmZmRiODc4YjIxMGJhYjM3Njc3In0%3D;', 
            },
            data : data
            };

            axios(config)
            .then(function (response) {
                function extractValueFromHTML(html) {
                    const dom = new JSDOM(html);
                    const targetElement = dom.window.document.querySelector("tr:last-child");
                    return targetElement.textContent.trim();
                  }
                  
                const htmlString = JSON.stringify(response.data) // the HTML string provided in the question
                const string = extractValueFromHTML(htmlString);

                const numberRegex = /\d+(\.\d+)?/;
                const matches = string.match(numberRegex);
                const value = matches ? matches[0] : null;

                res.send(value)
            })
                
        
        }
        catch (err) {
            return res.send(err)
        }
        
    })

router.route('/get-rates') 
    .post(
        //   (...args) => authValidation.authValidator(...args),
          (...args) => controller.getRates(...args)
         )




app.listen(PORT, () => {
    console.log(`Connected to PORT ${PORT}!`)
})

