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




function savepic(url,name){
//   http.get(url, function(res){
//     var imgData = "";

//     res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开


//     res.on("data", function(chunk){
//         imgData+=chunk;
//     });

//     req.on('error', function(e) {
// 	  console.log('problem with request: ' + e.message);
// 	});

//     res.on("end", function(){
        // fs.writeFile("./bookcover/"+name, imgData, "binary", function(err){
        //     if(err){
        //         console.log("down fail");
        //     }else{
        //     	console.log("down success:"+name);
        //     	ep.emit("finishwrite",id)
        //     }
            
        // });
//     });
// });

	request
	  .get(url)
	  .on('response', function(response) {
	    console.log(response.statusCode) // 200 
	    console.log(response.headers['content-type']) // 'image/png' 
	  })
	  .on('error', function(err) {
	    console.log("------------------------------------------------error:"+error);
		    	var emmitData = {
		            	"url":url,
		            	"name":name
		            };
		    	setTimeout(function() {
		        	ep.emit("connectrefuse",emmitData)

		    	}, 3000);
	  })
	  .pipe(fs.createWriteStream("./bookcover/"+name).on('error',function(err){
            console.log("writeFile fail");
            })
	  		.on('close',function(){
	  			console.log("down success:"+name);
            	ep.emit("finishwrite",name)
	  		})
	  	)
}


function crawlBookCover(start,step,crawlnumber){
	var offset = offset;
	var cate = 1400;
	var coverurl = "http://file.qreader.me/cover.php?id=";
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
		          		var imgname = bookid+".jpg"
		          		savepic(coverurl+obj.kuaidu_id,imgname)
		          })
            	
            }
          }
        )
      
      })

	ep.tail("connectrefuse",function(data){
    	var url = data.url;
    	var name = data.name;
        savepic(url,name)
      })

    ep.tail("catefinish",function(){
        console.log("------------------------------------------------all finish!!!!!!!!!!!!!");
      })
    
}
crawlBookCover(0,1,2)
ep.emit("finishwrite",1000)