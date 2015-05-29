var fs = require("fs")
var _ = require("underscore")
var EventProxy = require('eventproxy');
var ep = new EventProxy();
var ossApi = require('./oss_client');
var config = require('./config.json')
var option = {
    accessId: '0ykNDM0uXCaqmnOe'
   ,accessKey: 'CQ9K47h0fxmJEWbTRFCN8OYM1qA7P4'
};
var oss = new ossApi.OssClient(option);

function uploadfiletooss(bucket,file,folder){
  var filename = folder+ "/" + file
  oss.putObject(bucket, file+".jpg", filename, function(err,result) {
    if(err){
      console.log("upload err:"+file+"\n" +err)
    }
    console.log("upload file:"+file)
    deletefile(filename)
  })
}
function readdir(path){
  var start = 0;
  fs.readdir(path,function(err, files){
      /*_.times(30,function(n){
        console.log("index:"+n+"\n file:"+files[n])
      })*/

      /*var index = _.indexOf(files,"512-193146-step8");
      console.log(index)
      start = index;
      copyfile("./picture_bk/"+files[start], "./picture/"+files[start])
      ep.tail("copyfinish", function(par){
        start = start +1;
        if(files.length > start){
          copyfile("./picture_bk/"+files[start], "./picture/"+files[start])
        }
      })*/
      if(files.length>0){
        uploadfiletooss("recipe", files[0], path)
      }
      ep.tail("finishdelete", function(par){
        start = start +1;
        if(files.length > start){
          uploadfiletooss("recipe", files[start], path)
        }
      })
  })

  

  

}
function copyfile(source,target){
   var readable = fs.createReadStream(source);
    var writable = fs.createWriteStream(target);
    readable.pipe(writable);  
    readable.on("end", function () {  
                    writable.end();  
                    ep.emit("copyfinish") 
                    console.log("copy one:"+source);
                });  
    readable.on("error", function (err) {  
        console.log("error occur in reads");  
        callback(true, err);  
    });  
    

}
//readdir("./picture")
function deletefile(filename){
  fs.unlink(filename,function(err){
    if(err){
      console.log(err)
    }
    console.log("delete:"+filename)
    setTimeout(function() {
                
                ep.emit("finishdelete",1)

            }, 50);
    
  })
}
readdir("./picture16")