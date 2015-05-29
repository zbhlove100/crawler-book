var couchbase = require("./couchbase.js")
var EventProxy = require('eventproxy');
var mysqlclient = require('./utils/mysqlutils.js')
var http = require("http")
var request = require('request');
//var db = couchbase.getbucket("recipe-list")
var ep = new EventProxy();
var totalpage = 1;
var cheerio = require('cheerio');  
var _ = require("underscore")

var fs = require("fs")

function insertBookDetail(id,kuaidu_id){
	
			  	
	var postData = {
  "id": parseInt(kuaidu_id),
  "header_ch": "360",
  "header_av": "4.0.1",
  "header_m": 17087068,
  "header_seq": 173,
  "header_u": 17087068,
  "header_dt": 0,
  "header_did": "355136053720226",
  "header_nt": 1
}

	// var options = {
	//   "hostname": 'm.qreader.me',
	//   "port": 80,
	//   "path": '/query_books.php',
	//   "method": 'POST',
	//   "headers": {
	//   	'Content-Type': 'application/json',  
 //        'Content-Length': postData.length
	//   }
	// };
	var options = {
			headers: {"Content-Type": "application/json"},
		    url: 'http://m.qreader.me/query_catalog.php',
		    method: 'POST',
		    json:true,
		    body: postData
		};

		function callback(error, response, data) {
		    if (!error && response.statusCode == 200) {
		        var catalog = data.catalog;	
			  
			  	var itemid = data.id;
			  	var itemname = data.name;
			  	var catalog_t = data.catalog_t;
			  	
		  		console.log("------------------------------------------------book name:"+data.name);
		  		console.log("------------------------------------------------catalog size:"+catalog.length);

		  		_.each(catalog,function(obj,index){
		          		var queryobj = {}
						queryobj.sql = "insert book_catalog(kuaidu_id,name,catalog_t,cid_i,cid_n)"+ 
								"values (:kuaidu_id,:name,:catalog_t,:cid_i,:cid_n)";
						queryobj.params = {"kuaidu_id":itemid,
											"name":itemname,
											"catalog_t":catalog_t,
											"cid_i":obj.i,
											"cid_n":obj.n
										}
						mysqlclient.query(
				          queryobj,function(err,rows){
				            if (err || !rows || rows.affectedRows === 0) {

				                console.log("mysql err:"+err)
				                console.log("error a row to mysql:id:"+id+"|index:"+index)
				            }
				            
				          }
				        )
		          })
		  		


			  	setTimeout(function() {
		                
		        	ep.emit("finishwrite",id)

		    	}, 3000);	
		    }else{

		    	console.log("------------------------------------------------error:"+error);
		    	
		    	setTimeout(function() {
		            var emmitData = {
		            	"id":id,
		            	"kuaidu_id":kuaidu_id
		            };
		        	ep.emit("connectrefuse",emmitData)

		    	}, 3000);
		    }
		}

	request(options, callback);


	
}



function crawlBookCatalog(start,step,crawlnumber){

	var vote = 0;
	// ep.tail("finishwrite",function(data){
	// 	vote = vote +1;
	// 	console.log("------------------------------------------------vote1!!!!!");
	// 	if(vote == step){
	// 		vote = 0;
	// 		console.log("------------------------------------------------All--vote!!!!!");
	// 		ep.emit("finishtrunk",1000)

	// 	}
        
 //      })
    ep.tail("finishwrite",function(){

      if(start >= crawlnumber){
      	ep.emit("finishwrite",1000)
        
      }
      var queryobj = {}
      queryobj.sql = "select id,kuaidu_id from book order by id asc limit :start,:step";
      queryobj.params = {"start":start,"step":step}
      console.log("event start to crawler! at start:"+start +"&&step:"+step)
      mysqlclient.query(
          queryobj,function(err,rows){
            if (err || !rows || rows.affectedRows === 0) {
                console.log("mysql err:"+err)
                console.log("mysql search num:"+start)
            }else{
            	console.log("finish search mysql:"+rows.length)
		          start = start + step;
		          var queuelist = [];
		          _.each(rows,function(obj,index){
		          		var bookid = obj.kuaidu_id;
		          		console.log("---------------------------------------------mysql---bookid:"+bookid);
		          		insertBookDetail(obj.id,obj.kuaidu_id);
		          })
            	
            }
          }
        )
      
      })
    ep.tail("connectrefuse",function(data){
    	var id = data.id;
    	var kuaidu_id = data.kuaidu_id;
        insertBookDetail(id,kuaidu_id)
      })




    ep.tail("allfinish",function(){
        console.log("------------------------------------------------all finish!!!!!!!!!!!!!");
        return false;
      })
    
}
//crawlBookCatalog(0,1,14062)
crawlBookCatalog(5868,1,14063)
ep.emit("finishwrite",1000)