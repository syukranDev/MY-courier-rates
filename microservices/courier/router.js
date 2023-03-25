const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const router = express.Router()

const controller = require('./model/controller')
const authValidation = require('./components/authValidation')

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
            return res.send('Hello World!')
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

module.exports = app

