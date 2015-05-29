var couchbase = require("./couchbase.js")
var EventProxy = require('eventproxy');
var mysqlclient = require('./utils/mysqlutils.js')
var http = require("http")
var request = require('request');
//var db = couchbase.getbucket("recipe-list")
var ep = new EventProxy();
var totalpage = 1;
var cheerio = require('cheerio');  
var Iconv  = require('iconv').Iconv;
var Buffer = require('buffer').Buffer;

var fs = require("fs")

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
function insertCategory(){


	fs.readFile('./bookcategory.json',function(err,data){
	    if(err) throw err;


	    var category = JSON.parse(data);
	    console.log(category.categorys[1].name)

	    
        for(var i=0;i<category.categorys.length;i++){
        	var queryobj = {}
        	queryobj.sql = "insert category(cate_code,description,name) values (:cate_code,:description,:name)";
        	queryobj.params = {"cate_code":category.categorys[i].id+"","description":category.categorys[i].desc,"name":category.categorys[i].name}
	        mysqlclient.query(
	          queryobj,function(err,rows){
	            if (err || !rows || rows.affectedRows === 0) {
	                console.log("mysql err:"+err)
	            }
	            console.log("insert a row to mysql:")
	          }
	        )
        }
        

	})
	
}

function insertBooklist(offset,cate){

	console.log("------------------------------------------------offset:"+offset);
	var postData = {
	  "cateid": cate,
	  "header_ch": "360",
	  "header_av": "4.0.1",
	  "header_m": 17087068,
	  "header_seq": 172,
	  "header_u": 17087068,
	  "header_dt": 0,
	  "header_did": "355136053720226",
	  "type": 0,
	  "offset":offset,
	  "header_nt": 1
	};

	console.log("------------------------------------------------postData.cateid:"+postData.cateid);
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
		    url: 'http://m.qreader.me/query_books.php',
		    method: 'POST',
		    json:true,
		    body: postData
		};

		function callback(error, response, data) {
		    if (!error && response.statusCode == 200) {
		        var booklist = data.books;	
			  	console.log("------------------------------------------------total:"+data.total);
			  	//console.log("------------------------------------------------header:"+JSON.stringify(response.headers));
			  	console.log("------------------------------------------------book cate:"+booklist[0].cate);
			  	for(var i=0;i<booklist.length;i++){
			  		var book = booklist[i];
			  		console.log("------------------------------------------------book name:"+book.name);
			  		
			  		var queryobj = {}
					queryobj.sql = "insert book(kuaidu_id,name,author,cate,cate_code,status,kuaidu_img,description)"+ 
								"values (:kuaidu_id,	:name,:author,:cate,:cate_code,:status,:kuaidu_img,:description)";
					queryobj.params = {"kuaidu_id":book.id,
										"name":book.name,
										"author":book.author,
										"cate":book.cate,
										"cate_code":cate,
										"status":book.status,
										"kuaidu_img":book.img,
										"description":book.desc
									}
					mysqlclient.query(
			          queryobj,function(err,rows){
			            if (err || !rows || rows.affectedRows === 0) {
			                console.log("mysql err:"+err)
			            }
			            console.log("insert a row to mysql:")
			          }
			        )

			  	}

			  	setTimeout(function() {
		                
		        	ep.emit("finishwrite",1000)

		    	}, 3000);	
		    }else{

		    	console.log("------------------------------------------------error:"+error);
		    	if(error==null){
		    		setTimeout(function() {
		                
		        		ep.emit("catefinish",1000)

		    		}, 3000);
		    	}
		    	setTimeout(function() {
		                
		        	ep.emit("connectrefuse",500)

		    	}, 3000);
		    }
		}

	request(options, callback);


	
}

function savepic(url,name){
  http.get(url, function(res){
    var imgData = "";

    res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开


    res.on("data", function(chunk){
        imgData+=chunk;
    });

    res.on("end", function(){
        fs.writeFile("./picture18/"+name, imgData, "binary", function(err){
            if(err){
                console.log("down fail");
            }
            console.log("down success:"+name);
        });
    });
});
}


function crawlBooklist(offset){
	var offset = offset;
	var cate = 1400;
	insertBooklist(offset,cate)
    ep.tail("finishwrite",function(data){
    	console.log("------------------------------------------------finishwrite param"+data);
        offset +=20;
        insertBooklist(offset,cate)
      })
    ep.tail("connectrefuse",function(data){
    	console.log("------------------------------------------------connectrefuse param"+data);
        insertBooklist(offset,cate)
      })
    // ep.tail("catefinish",function(){
    // 	offset = 0;
    // 	cate = cate + 100;
    // 	if(cate > 1400){
    // 		ep.emit("allfinish",1000)
    // 	}else{
    // 		ep.emit("finishwrite",1000)
    // 	}
        
    //   })
    ep.tail("catefinish",function(){
        console.log("------------------------------------------------all finish!!!!!!!!!!!!!");
      })
    
}
crawlBooklist(720)