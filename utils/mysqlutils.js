var mysql     = require("mysql");
var mysqlPool = null;
var config = require('../config.json')

function initMysqlPool () {
    mysqlPool = mysql.createPool({
    multipleStatements: true,
    connectionLimit : config.connectionLimit,
    host            : config.database_url,
    database        : config.database_name,
    user            : config.database_user,
    password        : config.database_pass
  });
}

exports.query = function (sqlReq, callback) {
    //sql, params
    if (!mysqlPool) {
        initMysqlPool();
    }

    if (!sqlReq) {
        throw new DBError("the sqlReq is null");
    }

    var sql_pattern = sqlReq.sql || "";
    if (sql_pattern.length === 0) {
        throw new DBError("the sql is empty");
    }

    mysqlPool.getConnection(function (err, connection) {

        if (err) {
            throw err;
        }

        connection.config.queryFormat = function (query, values) {
            if (!values) return query;
            return query.replace(/\:(\w+)/g, function (txt, key) {
              if (values.hasOwnProperty(key)) {
                return this.escape(values[key]);
              }
              return txt;
            }.bind(this));
        };

        connection.query(sql_pattern, sqlReq.params, function (err, rows) {
            connection.release();
            return callback(err, rows);
        });
    });
};

exports.getpool = function(){
  if (!mysqlPool) {
        initMysqlPool();
    }

   return mysqlPool;
}