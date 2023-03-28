const express = require('express')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const config = require('./config/dev.json')
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const router = express.Router()
const app = express()
const controller = require('./model/controller')
const Employee = require('./model/mongo_schema')

const swaggerDocument = YAML.load('./swagger.yaml')
app.use('/portal/auth/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))


app.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", config.ACCESS_CONTROL_ALLOW_ORIGIN);
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

app.use('/portal/auth', router)  


router.route('/testdb')
    .post((...args) => controller.mongoConnectionTest(...args))

router.route('/login')
    .post((...args) => controller.loginUser(...args))

router.route('/verifyToken')
    .post((...args) => controller.verifyToken(...args))

router.route('/logout') 
    .post(
          (...args) => controller.authValidator(...args),
          (...args) => controller.logoutUser(...args)
         )

router.route('/test')
    .post(
        //   (...args) => controller.authValidator(...args),
          (...args) => controller.test(...args))


module.exports = app

