var _ = require('lodash')
const sql = require('../components/sql/queries')

module.exports = class courier {

    getRates(req){
        return new Promise((resolve, reject) => {
            return sql.getRates(req)
                .then(result => {
                    return resolve(result)
                })
                .catch(err => {
                    return reject(err)
                })
        })
    }
}