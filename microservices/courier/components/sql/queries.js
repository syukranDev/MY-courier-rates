const sql = require('./index')
const utils = require('../../components/utils')
const logger = require("../logger").logger;

const axios = require('axios');
const qs = require('querystring');
const { JSDOM } = require('jsdom');
const courierRates = require('../../model/mongo_schema')


var getRates = arg => {
    return new Promise(async (resolve, reject) => {
            let data = {
                from_country : arg.body.from_country,
                from_state : arg.body.from_state,
                from_postcode : arg.body.from_postcode,
                to_country : arg.body.to_country,
                to_state : arg.body.to_state,
                to_postcode : arg.body.to_postcode,
                length : arg.body.length,
                width : arg.body.width,
                height : arg.body.height,
                type : arg.body.type,
                parcel_weight : arg.body.parcel_weight
            }
            //Below to check from database first if we have same request.body used before, if no match case in database then we get data from Couriers API and save it into database.
            //If there is match case of request.body, then it will fetch data from our database.
            const checkRateExist = await courierRates.find(data)
            if (!checkRateExist.length) {
                let dataPromise1 = {
                    "origin_country": arg.body.from_country, 
                    "origin_state": arg.body.from_state,
                    "origin_postcode": arg.body.from_postcode,
    
                    "destination_country":arg.body.to_country,
                    "destination_state": arg.body.to_state,
                    "destination_postcode": arg.body.to_postcode,
    
                    "length": arg.body.length ,
                    "width": arg.body.width ,
                    "height": arg.body.height ,
                    "selected_type": arg.body.type,
                    "parcel_weight": arg.body.parcel_weight,
                    "document_weight": '' //focused on parcel only for simplicity purposes, since only JnT API have document weight field.
                }
    
                const dataPromise2 = qs.stringify({
                    '_token': 'v1zAgU1pUEw4GXmrRt0wOcXnaTFDsB7aWNNVlul5', //need to change this when expired appx 24hours?
                    'shipping_rates_type': arg.body.domestic == 'Y' ? 'domestic' : 'international',
                    'sender_postcode': arg.body.from_postcode,
                    'receiver_postcode': arg.body.to_postcode,
                    'destination_country': arg.body.domestic == 'Y' ? 'BWN' : 'BWN', //unknown international codes
                    'shipping_type': 'EZ', //fixed regular
                    'weight': arg.body.parcel_weight,
                    'length': arg.body.length,
                    'width': arg.body.width,
                    'height': arg.body.height,
                    'item_value': '' //fixed value null @ no insurance
                    });
    
                const citylinkPromise = await axios.post('https://www.citylinkexpress.com/wp-json/wp/v2/getShippingRate', dataPromise1)
                                        .then(responses => {
                                            return ({ 
                                                courier: 'Citilink',
                                                rateInRinggit: responses.data.req.data.rate
                                            })
                                        })
    
                const jntPromise = axios(
                                    {
                                        method: 'post',
                                        url: 'https://www.jtexpress.my/shipping-rates',
                                        headers: { 
                                            'accept': '*/*', 
                                            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 
                                            'x-requested-with': 'XMLHttpRequest', 
                                            //need to change below cookie xsrf token when expired appx 24hours?
                                            'Cookie': '_ga=GA1.2.1799226497.1678279692; XSRF-TOKEN=eyJpdiI6InRGVDhHZnBLbzBUSWdCdC9PSnJZb3c9PSIsInZhbHVlIjoiS0hFUFhEUVRUQkhYVkJ0Y2NZQ3hISkJyZzNma0lSSjk3TkpXZzk2QS9oOFpVWE9UVXREUFF2bTNNdnRSZHR2NHo3TEF1M29ETkIzMmExclpwNG0yeVJib0ZxQTFEVHk2ejVIUERTZmRSUEpoQnhvTmNVK0VEbkw1K0FxNWhhaGEiLCJtYWMiOiIxYmZhMTg0YzljNGQ5M2UxYTRhNDgzODNlYTIxMDNiYjMxMjkxYjVkOTVjMTMxY2ZkZGYxZGU4NjA0MDNmY2JjIn0; jt_express_malaysia_session=eyJpdiI6IkwyWWtUUXpZb05tSE5KS2NSaFlkeGc9PSIsInZhbHVlIjoiQUtZV1RLbHNEVHUzNURZbDRpci9idzJEbzlMUDRMdFBuY0VFaFV5VHBmK3NmOFdoVlozUVVYU2VZOXFjL2VvYno4REJ3c0o1N2swZUk5WlBIRXN0NXd6M05ZbTZZaW5ab0NQWVJpU1pXbk5tUkdNVDF4dElJY2pXVFU1N2l1Zi8iLCJtYWMiOiJmZGMxYjEyMTYyNmM1NjIyNjNlNjFiNjYyYWIyMGZhYWRiODM1YTE0YjQ0NzJkMmE4YzMyYzllMDU1OTQ1ZTk0In0%3D; _gid=GA1.2.514885323.1680020860; _gat_gtag_UA_127851323_1=1',  
                                        },
                                        data : dataPromise2
                                    })
                                    .then(function (response) {
                                        function extractValueFromHTML(html) {
                                            const dom = new JSDOM(html);
                                            const targetElement = dom.window.document.querySelector("tr:last-child");
                                            return targetElement.textContent.trim();
                                        }
                                        
                                        const htmlString = JSON.stringify(response.data) 
                                        const string = extractValueFromHTML(htmlString);
    
                                        const numberRegex = /\d+(\.\d+)?/;
                                        const matches = string.match(numberRegex);
                                        const value = matches ? matches[0] : null;
    
                                        return ({
                                            courier: 'J&T',
                                            rateInRiggit: parseFloat(value) 
                                        })
                                    })
    
                Promise.all([citylinkPromise, jntPromise]).then(result => {
                    const [data1, data2] = result
                    const combinedData = [{...data1},{...data2}]
                    return combinedData

                }).then(async result => {
                    let courierRate = JSON.stringify(result)
                    let data = {
                        domestic: arg.body.domestic,
                        from_country: arg.body.from_country,
                        from_state: arg.body.from_state, 
                        from_postcode: arg.body.from_postcode,
                        to_country: arg.body.to_country, 
                        to_state: arg.body.to_state, 
                        to_postcode: arg.body.to_postcode, 
                        length: arg.body.length, 
                        width: arg.body.width, 
                        height: arg.body.height, 
                        type: arg.body.type,
                        parcel_weight: arg.body.parcel_weight,
                        doc_weight: null, //we make it null siince in this project we focused on parcel weight only as not all external API has doc_weight
                        rates: courierRate
                    }

                    let newCourierRates = new courierRates(data)

                    await newCourierRates.save() //hidden process to save into database for next same querying
                    .then(() => {
                        logger.info('=========================================================================')
                        logger.info('=========================================================================')
                        logger.info('====================== Data fetched from : External 3rd Party Courier API')
                        //
                        console.log('=========================================================================')
                        console.log('=========================================================================')
                        console.log('=========================================================================')
                        console.log('====================== Data fetched from : External 3rd Party Courier API')
                        return resolve(result)
                    })
                    .catch(err => {
                        logger.error({
                            path: "dbQueries/saveRatesQuery/catch",
                            query: query,
                            queryData: data,
                            message: err && err.message,
                            stack: err && err.stack 
                        })
                        return reject ( {
                            statusCode: 500,
                            message: "System Error"
                        })
                    })
                }).catch(err => {
                    logger.error({
                        path: "dbQueries/authValidate/catch",
                        query: query,
                        queryData: data,
                        message: err && err.message,
                        stack: err && err.stack 
                    })
                    return reject ( {
                        statusCode: 500,
                        message: "System Error"
                    })
                })
    
            } else {
                //Get saved cache from database if all request body is same from database
                const data = JSON.parse(checkRateExist[0].rates)
                logger.info('=========================================================================')
                logger.info('=========================================================================')
                logger.info('====================== Data fetched from : Database')
                //
                console.log('=========================================================================')
                console.log('=========================================================================')
                console.log('=========================================================================')
                console.log('====================== Data fetched from : Database')
                return resolve(data)
            }

    })
}

module.exports = {
    getRates :  getRates
}