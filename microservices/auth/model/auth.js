var _ = require('lodash')
const sql = require('../components/sql/queries')

module.exports = class auth {
    refreshToken(req){
        return new Promise((resolve, reject) => {
            return sql.refreshToken(req)
                .then(result => {
                    return resolve(result)
                })
                .catch(err => {
                    return reject(err)
                })
        })
    }

    clearToken(req){
        return new Promise((resolve, reject) => {
            return sql.clearToken(req)
                .then(result => {
                    return resolve(result)
                })
                .catch(err => {
                    return reject(err)
                })
        })
    }

    verifyToken(req){
        return new Promise((resolve, reject) => {
            return sql.verifyToken(req)
                .then(result => {
                    return resolve(result)
                })
                .catch(err => {
                    return reject(err)
                })
        })
    }
}