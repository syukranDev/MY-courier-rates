const mongoose = require('mongoose')
const Schema = mongoose.Schema

const authSchema = new Schema({
    username: String,
    auth_token : String
}, {timestamps: true})

const UserAuth = mongoose.model('auth_token', authSchema)

module.exports = UserAuth