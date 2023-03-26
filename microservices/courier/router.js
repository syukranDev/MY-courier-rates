const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const router = express.Router()
const config = require('./config/dev.json')

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const controller = require('./model/controller')
const authValidation = require('./components/authValidation')
const validation = require('./components/validation')

const swaggerDocument = YAML.load('./swagger.yaml')
app.use('/portal/courier/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))


app.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", config.ACCESS_CONTROL_ALLOW_ORIGIN);
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
            return res.send('this is test api.....')
        }
        catch (err) {
            return res.send(err)
        }
        
    })

router.route('/get-rates') 
    .post(
        (...args) => authValidation.authValidator(...args),  //Middleware 1 - to protect route with jwt token            :::: @ you can always disable this line if you dont want to test without this middleware
        (...args) => validation.getCourierRates(...args),    //Middleware 2 - to protect route with req.body validations :::: @ you can always disable this line if you dont want to test without this middleware
        (...args) => controller.getRates(...args)
        )

module.exports = app

