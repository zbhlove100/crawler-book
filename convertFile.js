var fs = require("fs")
var _ = require("underscore")
var EventProxy = require('eventproxy');
var ep = new EventProxy();
var iconv  = require('iconv-lite')


function copyfilefromlist(list,sourcefolder,targetfolder){
  var start = 0;

  _.each(list,function(obj,index){
    copyfile(sourcefolder+obj,targetfolder+obj)
  })

  

  

}
function convertfile(source,target){
    //console.log(source)
   // var readable = fs.createReadStream(source);
   //  var writable = fs.createWriteStream(target);
   //  readable.pipe(writable);  
   //  readable.on("end", function () {  
   //                  writable.end();  
   //                  ep.emit("copyfinish") 
   //                  console.log("copy one:"+source);
   //              });  
   //  readable.on("error", function (err) {  
   //      console.log("error occur in reads:"+err);   
   //  });  
	fs.readFile(source, function(err, data) {
	    if (err) {
	        console.error(err);
	    } else {
	        var str = iconv.decode(data,'gbk'); 
	        var str2 = iconv.encode(str, 'utf-8');
	 
	        fs.writeFile(target, str2, null, function (err) {
	            if (err){
	            	console.log('save error:'+source);
	            }else{
	            	console.log('It\'s saved!');

	            }
	            ep.emit("copyfinish") 
	        });
	    }
	});
    

}
function copylist(source,target){
  
 var listforcopy = [
      "50550-28219-main0",
"50573-28210-step5",
"50603-28165-step1",
"50646-27916-step4",
"50666-27903-step6",
"50684-27939-step2",
"50740-27735-step8",
"50791-27653-main0",
"50821-27404-step7"
      ]
  copyfilefromlist(listforcopy,source,target)
}
function copydir(source,target){
  var start = 0;
  fs.readdir(source,function(err, files){
      /*_.times(30,function(n){
        console.log("index:"+n+"\n file:"+files[n])
      })*/
      convertfile(source+"/"+files[start], target+"/"+files[start])
      ep.tail("copyfinish", function(par){
        start = start +1;
        if(files.length > start){
          convertfile(source+"/"+files[start], target+"/"+files[start])
        }
      })
      
  })
}
//copydir("./picture16","./picture16_bk")
copydir("./captures/","./utf8files/")