var ossApi = require('./oss_client');
var config = require('./config.json')
var _ = require("underscore")
var http = require("http")
var fs = require("fs")
var option = {
    accessId: '0ykNDM0uXCaqmnOe'
   ,accessKey: 'CQ9K47h0fxmJEWbTRFCN8OYM1qA7P4'
};

var oss = new ossApi.OssClient(option);

oss.putObject("recipe", "picture1/test1.jpg", "./picture/10-194534-main0", function(err) {
  if(err){
    console.log(err)
  }
    console.log("upload file:"+file)
  })


/*var url = "http://i3.meishichina.com/attachment/recipe/2012/11/15/20121115132752716753212.jpg";
http.get(url, function(res){
    var imgData = "";

    res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开


    res.on("data", function(chunk){
        imgData+=chunk;
    });

    res.on("end", function(){
        fs.writeFile("./picture/20121115132752716753212.jpg", imgData, "binary", function(err){
            if(err){
                console.log("down fail");
            }
            console.log("down success");
        });
    });
});*/