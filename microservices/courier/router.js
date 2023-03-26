const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const router = express.Router()

const controller = require('./model/controller')
const authValidation = require('./components/authValidation')
const validation = require('./components/validation')

app.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", '*');
    response.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    response.header("Access-Control-Allow-Headers", "Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    response.header('Access-Control-Allow-Credentials', true);
    response.header('Access-Control-Max-Age', '86400');
    next();
});

app.disable("x-powered-by")


app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ limit: '2mb', extended: true }));
app.use((err, req, res, next) => {
    err ? res.status(400).json({ message: 'Invalid JSON'}) : next()
})

app.use('/portal/courier', router)  

router.route('/testroute')
    .post((req, res) => {
        try {
            // return res.send('this is test api.....')

            const axios = require('axios');
            const qs = require('querystring');

            // const data = qs.stringify({
            //     '_token': 'A6UNLNxCC0nlCQkrnKS254VBvBy0xCF3yXbqp6UD',
            //     'shipping_rates_type': 'domestic',
            //     'sender_postcode': '42700',
            //     'receiver_postcode': '32610',
            //     'destination_country': 'BWN',
            //     'shipping_type': 'EZ',
            //     'weight': '10',
            //     'length': '1',
            //     'width': '1',
            //     'height': '1',
            //     'item_value': ''
            // });

            const data = qs.stringify({
                    '_token': 'o8XmfLairZzvC9bZprhT8n4iPUpZbZXBTLkWWoSP',
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
                    'Cookie': 'XSRF-TOKEN=eyJpdiI6IndEekhDMzh2c1FKMVBNWTY1dyt1OFE9PSIsInZhbHVlIjoidGY2STZuZEdCRVhNa0ZHWFBFUEI1UFcrUlBtK0Q3YzZxRG9jRVhrbnpRYUUzeUc4Tmo1ZHgzejQ4SzExcHF0RllqYnF3MVIwZEhKTU41bnlzemNUWnhoZU5yQWtCZGt1YWdUTU0vTUNBQ3U0Y0huTGVQWURmdW43cVlSTDBFdWsiLCJtYWMiOiI1YjMwZWZhODQwNmU0ZTIyYjk5YmRlMGQ1MmY5MTdlYjZjYWQzMGU0MDNiZTIyNDNhMDdjMTI2ODQxODJjM2YwIn0%3D' 
                },
                data : data
            };

            axios(config)
            .then(function (response) {
                console.log(response.data)
                const { JSDOM } = require('jsdom');

                function extractValueFromHTML(html) {
                  const dom = new JSDOM(html);
                  const targetElement = dom.window.document.querySelector("tr:last-child td:first-child");
                  return targetElement.textContent.trim();
                }
                
                const htmlString = response // the HTML string provided in the question
                const value = extractValueFromHTML(htmlString);
            })

        }
        catch (err) {
            return res.send(err)
        }
        
    })

router.route('/get-rates') 
    .post(
        //   (...args) => authValidation.authValidator(...args),
        // (...args) => validation.getCourierRates(...args),
        (...args) => controller.getRates(...args)
        )

module.exports = app

