var couchbase = require("./couchbase.js")
var EventProxy = require('eventproxy');
var mysqlclient = require('./utils/mysqlutils.js')
var http = require("http")
var request = require('request');
//var db = couchbase.getbucket("recipe-list")
var ep = new EventProxy();
var totalpage = 1;
var cheerio = require('cheerio');  
var iconv  = require('iconv-lite')
var _ = require("underscore")
var fs = require("fs")
var BufferHelper = require('bufferhelper');


function countLog(){
  console.log("----------------num------------------")
  console.log(testcount.catalog.length)

  for(var i=0;i<testcount.catalog.length;i++){
  	var catalog = testcount.catalog[i];
  	if(catalog.i!=i+1){
  		console.log("----------------break  num------------------")
  		console.log(i)
  		break;
  	} 
  }
}

function saveCapture(kuaidu_id,cid_i){
	
			  	
	var postData = {
	  "id": parseInt(kuaidu_id),
	  "header_ch": "360",
	  "header_av": "4.0.1",
	  "header_m": 17087068,
	  "header_seq": 500,
	  "header_u": 17087068,
	  "header_dt": 0,
	  "header_did": "355136053720226",
	  "header_nt": 1,
	  "cid": cid_i
	}

	


	var options = {
			headers: {"Content-Type": "application/json"},
		    url: 'http://chapter.qreader.me/download_chapter.php',
		    method: 'POST',
		    json:true,
		    body: postData
		};

		function callback(error, response, data) {
		    if (!error && response.statusCode == 200) {



			  		
		    }else{

		    	console.log("------------------------------------------------error:"+error);
		    	
		    	setTimeout(function() {
		            var emmitData = {
		            	"cid_i":cid_i,
		            	"kuaidu_id":kuaidu_id
		            };
		        	ep.emit("connectrefuse",emmitData)

		    	}, 100);
		    }
		}
	var name = kuaidu_id + "-" + cid_i+".txt";
	request(options, callback)
	.pipe(fs.createWriteStream("./captures/"+name).on('error',function(err){
            console.log("writeFile fail");
            })
	  		.on('close',function(){
	  			console.log("write success:--------------------------->"+name);
            	setTimeout(function() {
		                
		        	ep.emit("finishwrite",1000)

		    	}, 100);
	  		})
	  	)


	
}




function crawlCapture(start,step,crawlnumber){
	var offset = offset;
	var cate = 1400;
	var coverurl = "http://file.qreader.me/cover.php?id=";
	vote = 0;
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
      	ep.emit("allfinish",1000)
        return false;
      }
      var queryobj = {}
      queryobj.sql = "select id,kuaidu_id,cid_i from book_catalog order by id asc limit :start,:step";
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
		          		saveCapture(bookid,obj.cid_i)
		          })
            	
            }
          }
        )
      
      })

	ep.tail("connectrefuse",function(data){
    	var cid_i = data.cid_i;
    	var kuaidu_id = data.kuaidu_id;
        saveCapture(kuaidu_id,cid_i)
      })

    ep.tail("allfinish",function(){
        console.log("------------------------------------------------all finish!!!!!!!!!!!!!");
        return false;
      })
    
}
crawlCapture(0,10,100)
ep.emit("finishtrunk",1000)