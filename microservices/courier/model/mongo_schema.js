const mongoose = require('mongoose')
const Schema = mongoose.Schema

const courierRatesSchema = new Schema({
    domestic: String,
    from_country : String,
    from_state : String,
    from_postcode : String,
    to_country : String,
    to_state : String,
    to_postcode : String,
    length : String,
    width : String,
    height : String,
    type : String,
    parcel_weight : String,
    doc_weight : String,
    rates : String
}, {timestamps: true})

const courierRates = mongoose.model('courierRates', courierRatesSchema)

module.exports = courierRates