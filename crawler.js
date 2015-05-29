var Crawler = require("crawler").Crawler;
var couchbase = require("./couchbase.js")
var EventProxy = require('eventproxy');
var ep = new EventProxy();
var heapdump = require('heapdump');
var mysqlclient = require('./utils/mysqlutils.js')
var db = couchbase.getbucket("recipe-list")
var _ = require("underscore")

var totalrow = 1;
var cheerio = require('cheerio');
var ossApi = require('./oss_client');
var config = require('./config.json')
var http = require("http")
var fs = require("fs")
var option = {
    accessId: '0ykNDM0uXCaqmnOe'
   ,accessKey: 'CQ9K47h0fxmJEWbTRFCN8OYM1qA7P4'
};
var oss = new ossApi.OssClient(option);
var c = new Crawler({
"maxConnections":1,
onDrain: function() {
            // Wait a bit for the GC to kick in
            setTimeout(function() {
                
                ep.emit("startcrawl",3000)

            }, 3000);
        },
"jQuery":false,
// This will be called for each crawled page
"callback":function(error,result,$) {
     
}
});

//c.queue("http://home.meishichina.com/recipe-194015.html");

function getlist(startpoint,increasestep,crawlnumber){
  var total = 0;
  /*var queryobj = {}
        queryobj.sql = "select count(*) as totalitem from recipe";
        mysqlclient.query(
          queryobj,function(err,rows){
            if (err || !rows || rows.affectedRows === 0) {
                console.log("mysql err:"+err)
            }
            totalrow = rows[0].totalitem;
            console.log("total :"+totalrow)
            ep.emit("startcrawl",rows.totalitem)
          }
        )*/
    c.queue("http://www.baidu.com");
    var start = startpoint;
    ep.tail("startcrawl", function(par){
      if(start >= crawlnumber){
        return false;
      }
        var queryobj = {}
      queryobj.sql = "select id,name,url,oldid from recipe order by id asc limit :start,:step";
      queryobj.params = {"start":start,"step":increasestep}
      console.log("event start to crawler! at start:"+start +"&&step:"+increasestep)
      mysqlclient.query(
        queryobj,function(err,rows){
          if (err || !rows || rows.affectedRows === 0) {
              console.log("mysql err:"+err)
          }
          console.log("finish search mysql:"+rows.length)
          start = start + 5;
          var queuelist = [];
          _.each(rows,function(obj,index){
            var tempobj = {"uri":obj.url,"jQuery":false,"callback":function(err,result){
              $ = cheerio.load(result.body);
              var transparam = {"mysqlid":obj.id,"oldid":obj.oldid}
              var recipe = {}
              recipe.mysqlid = transparam.mysqlid + ""
              recipe.oldid = transparam.oldid
              recipe.material = [];
              recipe.tag = [];
              recipe.baseimg = [];
              recipe.block_txt = [];
              recipe.step = [];
              recipe.tip=[]
            $(".wrap #recipe_De_imgBox").each(function(index,a) {

                  var adom = $(a).find("img");
                  var imgname = transparam.mysqlid + "-" + transparam.oldid + "-" + "main" + index;
                  var iname= "main"+index
                  var rbaseimg = {"ossname":imgname,"src":$(adom).attr("src"),"name":iname}
                  recipe.baseimg.push(rbaseimg)
                  savepic(rbaseimg.src, imgname)
                  //console.log($("adom").attr("src"))
              })
              $(".wrap .recipeTag>a").each(function(index,a) {
                  var tag = {name:$(a).text()}
                  recipe.tag.push(tag)
                  //console.log($("adom").attr("src"))
              })
              
            $(".wrap .recipeCategory").each(function(index,a) {
              
              var recipeCategory = []
                  $(a).find(".recipeCategory_sub").each(function(index1,inner){
                    var item = {}
                    item.categoryname = $(inner).find(".recipeCategory_sub_L").text()
                    item.detal = []
                    $(inner).find(".recipeCategory_sub_R>ul>li").each(function(index2,inner2){
                      var it1 = {}
                      it1.name = $(inner2).find(".category_s1").text()
                      it1.amount = $(inner2).find(".category_s2").text()
                      it1.picture = ""
                      //console.log(it1)
                      item.detal.push(it1)
                    })
                    recipeCategory.push(item)
                  })
                  recipe.material = recipeCategory;
                  //console.log($("adom").attr("src"))
              })

              $(".wrap #block_txt>div").each(function(index,a) {
                  var block_txt = $(a).text()
                  recipe.block_txt.push(block_txt)
                  //console.log($("adom").attr("src"))
              })
              $(".recipeStep>ul>li").each(function(index,a) {
                var step = {}
                step.name = index+1;
                  var adom = $(a).find("img");

                  step.img = $(adom).attr("src")
                  var imgname = ""
                  if(step.img){
                    imgname = transparam.mysqlid + "-" + transparam.oldid + "-" + "step" +step.name
                    savepic(step.img,imgname)
                    

                  }else{
                    step.img = ""
                  }
                  var textdom = $(a).find(".recipeStep_word");
                  step.description = $(textdom).text()
                  step.imgossname = imgname;
                  recipe.step.push(step)
                  //console.log($("adom").attr("src"))
              })
              var tip = $(".wrap .recipeTip").text()
              recipe.tip.push(tip)
              db.insert(recipe.mysqlid,recipe,function(err,result){
                if(err)
                  console.log("couchbase write err"+err)
                console.log("Write a couchbase obj!recipe mysqlid:"+recipe.mysqlid)
              })
              //console.log(recipe)
              }
            }
            queuelist.push(tempobj)
          })
          c.queue(queuelist)
        }
      )
      
    });  
  
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
getlist(53966-5,5,54000)