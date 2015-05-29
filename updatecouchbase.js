var Crawler = require("crawler").Crawler;
var couchbase = require("./couchbase.js")
var EventProxy = require('eventproxy');
var ep = new EventProxy();
var mysqlclient = require('./utils/mysqlutils.js')
var db = couchbase.getbucket("recipe-list")
var _ = require("underscore")

function getandset(start){
	var queryobj ={}
	queryobj.sql = "select id,name,url,oldid from recipe order by id asc limit :start,1";
      queryobj.params = {"start":start}
      mysqlclient.query(
        queryobj,function(err,rows){
          if (err || !rows || rows.affectedRows === 0) {
              console.log("mysql err:"+err)
          }
          console.log("mysql id:"+rows[0].id)
          db.get(rows[0].id+"", function(err, res) {
			  if (err) {
			    console.log("err:", err);
			    /*
			    operation failed { [Error: The key already exists in the server.] code: 12 }
			    */
			    return;
			  }
			  var result = res.value;
			  result.name = rows[0].name;
			    db.replace(rows[0].id+"",result,function(err,result){
                if(err)
                  console.log("couchbase update err"+err)
              	ep.emit("updatefinish",1)
              })
			}); 
          /*db.insert(recipe.mysqlid,recipe,function(err,result){
                if(err)
                  console.log("couchbase write err"+err)
                console.log("Write a couchbase obj!recipe mysqlid:"+recipe.mysqlid)
              })*/
          
         })
}
function update(){
	var start = 0;
	getandset(start)
	ep.tail("updatefinish", function(par){
		if(start>51003){
			return false;
		}else{
			start = start +1;
			getandset(start)
		}
		

	})
}
update(0)
