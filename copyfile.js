var fs = require("fs")
var _ = require("underscore")
var EventProxy = require('eventproxy');
var ep = new EventProxy();



function copyfilefromlist(list,sourcefolder,targetfolder){
  var start = 0;

  _.each(list,function(obj,index){
    copyfile(sourcefolder+obj,targetfolder+obj)
  })

  

  

}
function copyfile(source,target){
    //console.log(source)
   var readable = fs.createReadStream(source);
    var writable = fs.createWriteStream(target);
    readable.pipe(writable);  
    readable.on("end", function () {  
                    writable.end();  
                    ep.emit("copyfinish") 
                    console.log("copy one:"+source);
                });  
    readable.on("error", function (err) {  
        console.log("error occur in reads:"+err);   
    });  
    

}
function copylist(source,target){
  /*var listforcopy = ["1283-190916-step3",
  "131-194091-step7",
  "1552-190050-main0",
  "174-194032-step4",
  "1780-189339-step4",
  "1939-188675-step9",
  "196-194005-main0",
  "209-193854-step10",
  "2328-187324-step2",
  "2423-186828-main0",
  "2572-186461-step1",
  "2572-186461-step10",
  "2675-185968-step4",
  "2844-184946-step7",
  "561-192965-step5",
  "632-192745-step5",
  "734-192338-step4",
  "744-192325-step7",
  "76-194286-step3",
  "827-192077-main0",
  "871-192020-step1",
  "991-191723-step1"]*/
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
      copyfile(source+"/"+files[start], target+"/"+files[start])
      ep.tail("copyfinish", function(par){
        start = start +1;
        if(files.length > start){
          copyfile(source+"/"+files[start], target+"/"+files[start])
        }
      })
      
  })
}
//copydir("./picture16","./picture16_bk")
copydir("./bookcover/","./uploadcover/")