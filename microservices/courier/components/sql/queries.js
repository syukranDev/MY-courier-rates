const sql = require('./index')
const utils = require('../../components/utils')
const logger = require("../logger").logger;

const axios = require('axios');
const qs = require('querystring');
const { JSDOM } = require('jsdom');

var getRates = arg => {
    return new Promise(async (resolve, reject) => {
            let query = ` SELECT * FROM getrates WHERE 
            from_country =? AND
            from_state =? AND 
            from_postcode =? AND
            to_country =? AND 
            to_state =? AND 
            to_postcode =? AND 
            length =? AND 
            width =? AND 
            height =? AND 
            type =? AND
            parcel_weight =?
            `
            let data = [
                arg.body.from_country,
                arg.body.from_state, 
                arg.body.from_postcode,
                arg.body.to_country, 
                arg.body.to_state, 
                arg.body.to_postcode, 
                arg.body.length, 
                arg.body.width, 
                arg.body.height, 
                arg.body.type,
                arg.body.parcel_weight
            ]
            
            //Below to check from database first if we have same request.body used before, if no match case in database then we get data from Couriers API and save it into database.
            //If there is match case of request.body, then it will fetch data from our database.
            const checkRateExist= await sql.executeQuery(query, data)

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
                    '_token': 'EHZrSmZMLRWrowhv3hXcK8hyk3hXAY31G3NLfU6U',
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
                                            'Cookie': '_ga=GA1.2.1799226497.1678279692; _gid=GA1.2.277345308.1679729433; XSRF-TOKEN=eyJpdiI6IkVUaDlRdWlNMFVZc2U4bStSaTlzd3c9PSIsInZhbHVlIjoiSm1LREtpWk5aSldOSm16U01TNTdzYlNLei9wUFNpTUdva2gxS1NlT2grYndydC9EQVFmR2Y5K1pVK0dsYVM1YVVQN2lEWTdPemNVT2xPc0E2UFlJNnE3UC9kNzJ6a29weElYbTA3VDRka2tqdEFtKzVVUDRXNy91M2h0YnhGR0QiLCJtYWMiOiJiMzFiYzhiOWNlYjkxMTE1YjM5OTA5ZTQ3OTk3OTMyNmUzODI3MzM1YTQ2ZWNjYjYyMDc5YWVkNWY1MGI5N2RmIn0%3D; jt_express_malaysia_session=eyJpdiI6Im9KV2xQMWp6Y3hmWXhNalk4TjZvb1E9PSIsInZhbHVlIjoidUZRVUFwSTE5ZHhFbXZDb3NZMlpDdk83dEZuMjZQODYrdnBuQ284YWJkb1VOUnF1YmUvVFlqTkZPazl5SEZQMHdLcGJPblNValdPdG9FTmdmODhYZHlmUlN2d1RGYUZZSlh0WXYyNUVNVHhsa2FUTU1RYitjNmMrMkZUNi9wL0wiLCJtYWMiOiJkMzI3Y2Y2NzA5N2YxYmIzZGYxMWVjNzMxNWY2ODQyNGYzNWQyOWVhNDZiNzgwMGY4N2M2NWU5OTA1ODE1MTc3In0%3D; _gat_gtag_UA_127851323_1=1', 
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
                    let query = ` INSERT INTO getrates (domestic, from_country, from_state, from_postcode, to_country, to_state, to_postcode, length, width, height, type, parcel_weight, doc_weight, rates)  
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?)  
                                `
                    let data = [
                        arg.body.domestic,
                        arg.body.from_country,
                        arg.body.from_state, 
                        arg.body.from_postcode,
                        arg.body.to_country, 
                        arg.body.to_state, 
                        arg.body.to_postcode, 
                        arg.body.length, 
                        arg.body.width, 
                        arg.body.height, 
                        arg.body.type,
                        arg.body.parcel_weight,
                        courierRate
                    ]

                    await sql.executeQuery(query, data)
                    .then(() => {
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
                //Get saved cache from database
                const data = JSON.parse(checkRateExist[0].rates)
                // logger.info('====================== Data fetched from : Database')
                console.log('====================== Data fetched from : Database')
                 return resolve(data)
            }

    })
}

module.exports = {
    getRates :  getRates
}