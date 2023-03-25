
var utils = require('../components/utils')
const logger = require("../components/logger").logger;

var Courier = require('./courier')
const courier = new Courier()


const getRatesCtrl = (req) => {
    return new Promise(async  (resolve, reject) => {
            // console.log('Testing........')

            courier.getRates(req)
                .then(async (res_data) => {
                    return resolve(utils.prepareResponse(200, "success", res_data));
                })
                .catch(err => {
                    return reject({ errorMessage: err.message})
                })
        
    })
}

module.exports.getRates = function getRates(req, res) {
    let start_benchmark =process.hrtime()
    logger.info({
        route: 'getRatesCtrl',
        payload: req.body,
        info: 'START - getRatesCtrl'
    })

    return getRatesCtrl(req)
        .then((results) => {
            printEndLogs(start_benchmark, 'getRatesCtrl', results, 'END - getRatesCtrl with success');
            return res.send(results)
        })
        .catch(err => {
            printEndLogs(start_benchmark, 'getRatesCtrl', results, 'END - getRatesCtrl with success');
            res.status(err.statusCode).send(err)
        })
        
}

var printEndLogs = function (start_benchmark, route, results, info) {
	const diff = process.hrtime(start_benchmark);
	logger.info({
		route: route,
		results: results,
		info: info,
		benchmark: ((((+diff[0]) * 1e9) + (+diff[1])) / 1000000)
	});
};