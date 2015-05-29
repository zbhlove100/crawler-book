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
	
	console.log("------------------------------------------------insertBookDetail kuaidu_id:"+kuaidu_id);
			  	
	var postData = {
	  "id": parseInt(kuaidu_id),
	  "header_ch": "360",
	  "header_av": "4.0.1",
	  "token": "556588887eda84ea488b4844",
	  "header_m": 17087068,
	  "header_seq": 169,
	  "header_u": 17087068,
	  "header_dt": 0,
	  "header_did": "355136053720226",
	  "header_nt": 1
	}
	console.log("------------------------------------------------insertBookDetail postData:"+postData.id);
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
		    url: 'http://m.qreader.me/query_book_detail.php',
		    method: 'POST',
		    json:true,
		    body: postData
		};

		function callback(error, response, data) {
		    if (!error && response.statusCode == 200) {
		        var book = data;	
			  
			  	console.log("------------------------------------------------book cate:"+book.cate);
			  	
		  		console.log("------------------------------------------------book name:"+book.name);
		  		
		  		var queryobj = {}
				queryobj.sql = "update book set catalog_t=:catalog_t,chapter_c=:chapter_c,chapter_i=:chapter_i,chapter_n=:chapter_n,word=:word where kuaidu_id = :kuaidu_id";
				queryobj.params = {"catalog_t":book.catalog_t,
									"chapter_c":book.chapter_c,
									"chapter_i":book.chapter_i,
									"chapter_n":book.chapter_n,
									"word":book.word,
									"kuaidu_id":kuaidu_id
								}
				mysqlclient.query(
		          queryobj,function(err,rows){
		            if (err || !rows || rows.affectedRows === 0) {
		                console.log("mysql err:"+err)
		            }
		            console.log("update a row to mysql:id:"+id)
		          }
		        )

			  	console.log("------------------------------------------------queryobj:"+queryobj);

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



function crawlBookDetail(start,step,crawlnumber){

	var vote = 0;
	ep.tail("finishwrite",function(data){
		vote = vote +1;
		console.log("------------------------------------------------vote1!!!!!");
		if(vote == step){
			vote = 0;
			console.log("------------------------------------------------All--vote!!!!!");
			ep.emit("finishtrunk",1000)

		}
        
      })
    ep.tail("finishtrunk",function(){

      if(start >= crawlnumber){
      	ep.emit("finishwrite",1000)
        
      }
      var queryobj = {}
      queryobj.sql = "select id,kuaidu_id from book where chapter_i is NULL order by id asc limit :start,:step";
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
crawlBookDetail(0,5,100)
ep.emit("finishtrunk",1000)