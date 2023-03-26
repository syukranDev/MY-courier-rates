// Import mysql module
let mysql = require('mysql2');
let config = require('../../config/dev.json')

module.exports.executeQuery = function executeQuery(query, data) {
  // console.log({
  //   query: query,
  //   data: data
  // })
  let connection = mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
  });
  
  return new Promise((resolve, reject) => {
    connection.connect(function(e) {
      if (e) {
        reject('error: ' + e.message);
      } else {
        connection.query(query, data, function(e, rows) {
          if (e) {
            reject(e);
          } else {
            resolve(rows);
          }
        });
      }
    });
    
    // put timeout since have error if declared wihout
    setTimeout(() => {connection.end();}, 1500)
  });
}

