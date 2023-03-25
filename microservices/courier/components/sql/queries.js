const sql = require('./index')
const utils = require('../../components/utils')
const { query } = require('express')
const axios = require('axios')


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
            let records = []
            let data = {
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
                "parcel_weight": arg.body.weight,
                "document_weight": arg.body.jnt || '0'
            }

            await axios.post('https://www.citylinkexpress.com/wp-json/wp/v2/getShippingRate', data)
                .then(responses => {
                    records.push({ 
                        courier: 'Citilink',
                        rateInRinggit: responses.data.req.data.rate
                    })

                    return records
                }).then(async records => {
                    // Fetch from Courier 1
                        const axios = require('axios');
                        const qs = require('querystring');
                        const { JSDOM } = require('jsdom')

                        const data = qs.stringify({
                        '_token': 'ZUYcDLMuFs8cTaLkUjWZgOkRv94HKuAsSonReRXj',
                        'shipping_rates_type': arg.body.domestic == 'Y' ? 'domestic' : 'international',
                        'sender_postcode': arg.body.from_postcode,
                        'receiver_postcode': arg.body.to_postcode,
                        'destination_country': arg.body.domestic == 'Y' ? 'BWN' : 'BWN', //unknown international codes
                        'shipping_type': 'EZ', //fixed regular
                        'weight': arg.body.weight,
                        'length': arg.body.length,
                        'width': arg.body.width,
                        'height': arg.body.height,
                        'item_value': '' //fixed value null @ no insurance
                        });


                        const config = {
                        method: 'post',
                        url: 'https://www.jtexpress.my/shipping-rates',
                        headers: { 
                            'accept': '*/*', 
                            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 
                            'x-requested-with': 'XMLHttpRequest', 
                            'Cookie': 'XSRF-TOKEN=eyJpdiI6IjZwd0pqbkZrM3R0cHIwSlc3TEI1R3c9PSIsInZhbHVlIjoiTEsyb05SeE93RXpvajhzUG1KUjZUcWpNUFp2UmJrK1MzQ1JoUGhKUUVCc2NDTW5OWVF1S0NDZjhmOXczQlF4VnllRXJMZ1U2TlZEeGdla1lXN25rVkJYd3NNSktaRHJTcklvRVFvdFovVTRxQlpHWC90S1I5eENaZDFpa0ZCbXciLCJtYWMiOiJlY2MwNmM3NDVmNTU2ZGI2NWE4NGJjYTY1ZTFkNWJhZWQ1OGRhNTNhN2EyMDI0NDQ2Yjk1NmUwNzNlYjIzOTEzIn0%3D; jt_express_malaysia_session=eyJpdiI6IjNiWCs4aGs2cXlHQnlqQllRN0hoTXc9PSIsInZhbHVlIjoicjRiZ25xdnVvc1YybnZScTFRcUx1aXdvcHhid1JVNGwwUU5SUGZaQ0laRlpIL3orQkxoMjlQSGtYdmZLeHAvWFgyaFdqUEhJd2NCeisxeFdJQlREQ0JZR3BVT2ZLdjI0R2lkWTFvcVo3Z1d0a0NReEx5UXFSZ3Q4aVUwaUhGbDYiLCJtYWMiOiJiODkyMzg0ZDM2Y2JhZTViMjZkMjE0NjFjZGY0NWIwMTY2MjVjZjAxYzhhZDczNWM0OWU1MTQzZDI4MDYwNjA1In0%3D', 
                        },
                        data : data
                        };

                        await axios(config)
                        .then(function (response) {
                            function extractValueFromHTML(html) {
                                const dom = new JSDOM(html);
                                const targetElement = dom.window.document.querySelector("tr:last-child");
                                return targetElement.textContent.trim();
                            }
                            
                            const htmlString = JSON.stringify(response.data) // the HTML string provided in the question
                            const string = extractValueFromHTML(htmlString);

                            const numberRegex = /\d+(\.\d+)?/;
                            const matches = string.match(numberRegex);
                            const value = matches ? matches[0] : null;

                            records.push({
                                courier: 'J&T',
                                rateInRiggit: parseFloat(value)
                            })

                            return resolve(records)
                    })
                }).catch(err => {
                    return reject(err.message)
                })

        } catch (err)  {
            return reject (err)
        }
    })
}

// var verifyToken = (arg) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const getUsernameCreatedDate = await sql.executeQuery(`
//                 SELECT username, created_date FROM auth_token WHERE ?
//             `, { auth_token : arg.body.auth_token})
//             if (getUsernameCreatedDate) {
//                 const result = JSON.parse(JSON.stringify(getUsernameCreatedDate))
//                 return resolve({
//                     username: result[0].username,
//                     created_date : result[0].created_date
//                 })
//             }
            


//             // console.log('this is your token := ' + arg.body.auth_token)
//             // query = `SELECT username, created_date FROM auth_token WHERE auth_token = ?`

//             // await sql.executeQuery(query, [arg.body.auth_token])
//             //     .then(records => {
//             //         console.log(records)
//             //         if(records ){
//             //             let { username, created_date}  = records[0]
//             //             console.log(records)
//             //             return resolve ({username, created_date})
//             //         }

//             //         else return reject({ message: 'Authorization failed'})
//             //     })
//             //     .catch(err => {
//             //         return reject({ message: 'System Error- SQL query' + err.message})
//             //     })

//         } catch(err) {
//             return reject (err)
//         }
//     })
// }

module.exports = {
    getRates :  getRates
}