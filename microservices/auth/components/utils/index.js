const SECRET_KEY = 'learn-nodejs'
const jwt = require('jsonwebtoken')
const moment = require('moment')

function generateAuthToken(username) {
    let data = {
        username: username,
        date: new Date()
    }

    return jwt.sign(data, SECRET_KEY, { expiresIn: '30m'})
}

function verifyJWT(token) {
    return jwt.verify(token, 'learn-nodejs', { complete: true}, (err, decoded) => {
        if (err) {
            return err.message
        } else return decoded
    })
}

function currentDateFormat() {
    return moment().format('YYYY-MM-DD hh:mm:ss')
}

module.exports = {
    verifyJWT : verifyJWT,
    generateAuthToken: generateAuthToken,
    currentDateFormat : currentDateFormat
}