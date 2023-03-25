var httpRequest = require('request');


module.exports.authValidator = function authValidator(req, res, next) {
    req.auth = {};
    let VERIFY_AUTHTOKEN_URL = 'http://localhost:3003/portal/auth/verifyToken'
    var options = {
        "url": VERIFY_AUTHTOKEN_URL,
        "method": "POST",
        timeout: (1000 * 38), // sets timeout to 38 seconds
        data: req.body,
        headers: req.headers
    };
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    httpRequest(options, function (err, response, body) {
        if (err) {
            return res.status(401)
        }else {
            const parsedResponse = JSON.parse(response.body)
            if(response.statusCode == 200){
                req.auth = Object.assign(req.auth, parsedResponse.data)
                console.log('00')
                return next();
            }else{
                console.log('11')
                console.log(response.statusCode)
                // return res.status(response.statusCode)
                // return res.send(response.body) --working
                console.log(parsedResponse)
                return res.status(response.statusCode).send(parsedResponse)
            }
        }
    })
}