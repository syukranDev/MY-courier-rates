const sql = require('./index')
const utils = require('../../components/utils')
const { query } = require('express')

const axios = require('axios');
const qs = require('querystring');
const { JSDOM } = require('jsdom');
const { result } = require('lodash');


// var refreshToken = (arg) => {
//     return new Promise(async (resolve, reject) => {
//         const data = {
//             username: arg.body.username,
//             created_date :  utils.currentDateFormat()
//         }

//         try {
//             const checkUsernameExist = await sql.executeQuery(`SELECT username from auth_token WHERE ?`, {username: arg.body.username})
//             if (checkUsernameExist.length>0) {
//                 const results = JSON.parse(JSON.stringify(checkUsernameExist))
//                 if (results[0].username.includes(arg.body.username)) { 
//                     // console.log('1')
//                     const auth_token = utils.generateAuthToken(arg.body.username)
//                     const query = `UPDATE auth_token SET auth_token = ? WHERE username =?`
    
//                     await sql.executeQuery(query, [auth_token, arg.body.username])
//                     return resolve(auth_token)
//                 }
//             } else {
//                 // console.log('2')
//                 const auth_token = utils.generateAuthToken(arg.body.username)
//                 data.auth_token = auth_token

//                 const query = `INSERT INTO auth_token SET ?`

//                 await sql.executeQuery(query, data)
//                 return resolve(auth_token)
//             }
//         } catch(err) {
//             return reject({
//                 statusCode: 500,
//                 message: err.message
//             })
//         }
//     })
// }

var getRates = arg => {
    return new Promise(async (resolve, reject) => {
        try {
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
                "document_weight": arg.body.doc_weight || '0'
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

                console.log('=======================================================')
                console.log('=======================================================')
                console.log('=======================================================')
                console.log(dataPromise2)

            const citylinkPromise = await axios.post('https://www.citylinkexpress.com/wp-json/wp/v2/getShippingRate', dataPromise1)
                                    .then(responses => {
                                        // console.log(1)
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
                console.log(combinedData)
                return resolve(combinedData)
            })


        } catch (err)  {
            return reject (err.response && err.message)
        }
    })
}

module.exports = {
    getRates :  getRates
}