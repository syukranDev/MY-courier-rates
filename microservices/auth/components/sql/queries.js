const sql = require('./index')
const utils = require('../../components/utils')
const { query } = require('express')


var refreshToken = (arg) => {
    return new Promise(async (resolve, reject) => {
        const data = {
            username: arg.body.username,
            created_date :  utils.currentDateFormat()
        }

        try {
            const checkUsernameExist = await sql.executeQuery(`SELECT username from auth_token WHERE ?`, {username: arg.body.username})
            if (checkUsernameExist.length>0) {
                const results = JSON.parse(JSON.stringify(checkUsernameExist))
                if (results[0].username.includes(arg.body.username)) { 
                    const auth_token = utils.generateAuthToken(arg.body.username)
                    const query = `UPDATE auth_token SET auth_token = ? WHERE username =?`
    
                    await sql.executeQuery(query, [auth_token, arg.body.username])
                    return resolve(auth_token)
                }
            } else {
                const auth_token = utils.generateAuthToken(arg.body.username)
                data.auth_token = auth_token

                const query = `INSERT INTO auth_token SET ?`

                await sql.executeQuery(query, data)
                return resolve(auth_token)
            }
        } catch(err) {
            logger.error({
                path: "dbQueries/refreshToken/catch",
                query: query,
                queryData: data,
                message: err && err.message,
                stack: err && err.stack
            });
            return reject({
                statusCode: 500,
                message: "System Error"
            });
        }
    })
}

var clearToken = arg => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = `UPDATE auth_token SET auth_token = NULL WHERE username =?`
            console.log(arg.body.username)
            await sql.executeQuery(query, arg.body.username).then(()=> {
                return resolve()
            }).catch(err => {
                logger.error({
                    path: "dbQueries/clearToken/catch",
                    query: query,
                    queryData: data,
                    message: err && err.message,
                    stack: err && err.stack
                });
                return reject({
                    statusCode: 500,
                    message: "System Error"
                });
            })
        } catch (err)  {
            logger.error({
                path: "dbQueries/authValidate/catch",
                query: query,
                queryData: data,
                message: err && err.message,
                stack: err && err.stack
            });
            return reject({
                statusCode: 500,
                message: "System Error"
            });
        }
    })
}

var verifyToken = (arg) => {
    return new Promise(async (resolve, reject) => {
        try {
            const getUsernameCreatedDate = await sql.executeQuery(`
                SELECT username, created_date FROM auth_token WHERE ?
            `, { auth_token : arg.body.auth_token})
            if (getUsernameCreatedDate) {
                const result = JSON.parse(JSON.stringify(getUsernameCreatedDate))
                return resolve({
                    username: result[0].username,
                    created_date : result[0].created_date
                })
            }

        } catch(err) {
            logger.error({
                path: "dbQueries/verifyToken/catch",
                query: query,
                queryData: data,
                message: err && err.message,
                stack: err && err.stack
            });
            return reject({
                statusCode: 500,
                message: "System Error"
            });
        }
    })
}

module.exports = {
    refreshToken : refreshToken,
    clearToken :  clearToken,
    verifyToken : verifyToken
}