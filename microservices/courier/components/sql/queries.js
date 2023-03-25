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
                "width": arg.body.widhth ,
                "height": arg.body.height ,
                "selected_type": arg.body.jnt ,
                "parcel_weight": arg.body.jnt ,
                "document_weight": arg.body.jnt 
            }
            axios.post('https://www.citylinkexpress.com/wp-json/wp/v2/getShippingRate', data)
                .then( responses => {
                    records.push({ 
                        courier: 'CitiLink',
                        rate: responses.data.req.data.rate
                    })

                    return records
                }).then(records => {
                    // Fetch from Courier 1
                        const axios = require('axios');
                        const qs = require('querystring');
                        const { JSDOM } = require('jsdom')

                        const data = qs.stringify({
                        '_token': 'A6UNLNxCC0nlCQkrnKS254VBvBy0xCF3yXbqp6UD',
                        'shipping_rates_type': 'domestic',
                        'sender_postcode': '42700',
                        'receiver_postcode': '42700',
                        'destination_country': 'BWN',
                        'shipping_type': 'EZ',
                        'weight': '10',
                        'length': '1',
                        'width': '1',
                        'height': '1',
                        'item_value': ''
                        });

                        const config = {
                        method: 'post',
                        url: 'https://www.jtexpress.my/shipping-rates',
                        headers: { 
                            'accept': '*/*', 
                            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 
                            'x-requested-with': 'XMLHttpRequest', 
                            'Cookie': 'XSRF-TOKEN=eyJpdiI6IlNoYkFjNDhodFN0U0NiSzdvdjhuMmc9PSIsInZhbHVlIjoiUzJxaVRWb05SQzJPWTJVazBuNWJYcG9GdFVFK2Zsc290elEvSXZKdXZVWGV1empVdkh4ZnFxYkpIOWZseEdjU2ZkbHhIM3NsM3ZoMEh3MlF4TFNNT29ET3pTQWFyeElUSEFydDBReWo4dUpld1dwaURzYmdUUWFQbWZIeFZOcEoiLCJtYWMiOiI2ZGRkNTc4MjkyOTUwYThiNGRhMmMzYzk3NzllNjA0YWM5NzJmMThkNjE4MTU4NzE2MmYxMDQ2MWM2ZTQyZThhIn0%3D; jt_express_malaysia_session=eyJpdiI6IkFtbFZaMzV0eWJzc3FVS2hnYjZnK3c9PSIsInZhbHVlIjoieGs2ZHJUcUd4bWNGV3NkeTdmR0VMTUxlaVV3OGovTEdhZGFhaGc2c3haY3FrS1BFbzVVZWs3Qlg2NnFDSzA2T3FqZUZSMzk1eU80TlBPLy9ENXBGbTdzYVhyNkFOdlloUHVpMlRaZVFCR3pZSXNCcWFkZC8zTG1pcldGc2hBMU4iLCJtYWMiOiIzZTFmZmM3ZjE3NjUyM2Y1NWU2YzhmYmI1MzQyMDJkMDkyYzU0NjM3ODgzYjNmZmRiODc4YjIxMGJhYjM3Njc3In0%3D;', 
                        },
                        data : data
                        };

                        axios(config)
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
                                rates: parseFloat(value)
                            })

                            return resolve(records)
                    })
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