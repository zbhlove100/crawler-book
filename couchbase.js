var couchbase = require("couchbase");
var config = require('./config.json')
var _ = require("underscore")

/*exports.getvalue = function(argument) {
  db = new couch.Connection({host: config.db, bucket: config.bucket, password: config.password})

}*/
exports.getbucket = function(name){
  var cluster = new couchbase.Cluster(config.db)
  var db = cluster.openBucket(name,config.password, function(err) {
    if (err) {
      // Failed to make a connection to the Couchbase cluster.
      throw err;
    }
  })
  return db;
}

exports.listinsertvalue = function(doc) {
  var cluster = new couchbase.Cluster(config.db)
  var db = cluster.openBucket(config.listbucket,config.password, function(err) {
    if (err) {
      // Failed to make a connection to the Couchbase cluster.
      throw err;
    }
  })

  db.insert(doc.mysqlid,doc,function(err, res) {
    if (err) {
      console.log('operation failed'+obj.id, err);
      return;
    }
    console.log("insert a row:"+obj.id)
  })

  
}