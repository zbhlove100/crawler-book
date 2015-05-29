var Crawler = require("crawler").Crawler;
var couchbase = require("./couchbase.js")
var EventProxy = require('eventproxy');
var heapdump = require('heapdump');
var mysqlclient = require('./utils/mysqlutils.js')

//var db = couchbase.getbucket("recipe-list")
var ep = new EventProxy();
var totalpage = 1;
var cheerio = require('cheerio');  
var c = new Crawler({
  maxConnections:10,
  jQuery:false,
  onDrain: function() {
            // Wait a bit for the GC to kick in
            setTimeout(function() {
                
                ep.emit("finishwrite",3000)

            }, 1000);
        },

  callback:function(error,result) {
      // $ is a jQuery instance scoped to the server-side DOM of the page
    //var recipelist = []
    if(result){
      $ = cheerio.load(result.body);

      if($("#J_list>ul>li")){
        $("#J_list>ul>li").each(function(index,a) {  
            var adom = $(a).find(".pic>a");
            var url = $(adom).attr("href");
            var name = $(adom).attr("title");
            var oldid = $(a).attr("data-id");
            
            //recipelist.push(item)
            var queryobj = {}
            queryobj.sql = "insert recipe(name,url,oldid) values (:name,:url,:oldid)";
            queryobj.params = {"name":name,"url":url,"oldid":oldid}
            mysqlclient.query(
              queryobj,function(err,rows){
                if (err || !rows || rows.affectedRows === 0) {
                    console.log("mysql err:"+err)
                }
                console.log("insert a row to mysql:")
              }
            )
            
            //
        });
      }
    }
    result.body = null;
          
  }
  });
function getHtml(list){
  c.queue(list);
}

function getmaxpage(){
  var c1 = new Crawler({
  "maxConnections":1,

  // This will be called for each crawled page
  "callback":function(error,result,$) {
    
      // $ is a jQuery instance scoped to the server-side DOM of the page
    var maxpage = 1;
    var asize = $(".ui-page>.ui-page-inner a").length; 
    $(".ui-page>.ui-page-inner a").each(function(index,a) {
      if(index == (asize-2)){
        maxpage = $(a).text();
        totalpage = maxpage;
        ep.emit('list', maxpage);

      }
    })
    
      
  }
  });
  c1.queue("http://home.meishichina.com/recipe-list.html");
}
function crawl(){
  getmaxpage();
  var start = 2;
  var urltemplate = "http://home.meishichina.com/recipe-list-page-{page}.html"
  var queue = []
  ep.all("list", function(maxpage){
      var j = 1;
      queue = ["http://home.meishichina.com/recipe-list.html"] 
      getHtml(queue)
      /*ep.after('got_file', maxpage, function (list) {
        couchbase.listinsertvalue(recipelist);
      });*/
      
  });
  ep.tail("finishwrite",function(){
        queue = []
        console.log('finish ++++++++++++++++++++++++++++++++++++++++++++++++++++:'+start);
        /*if(start == 502){
          console.log("stop crawl!!!!!!!")
          return true;
        }*/
        var stepincre = 10;
        if(start<totalpage){
          start = start+stepincre >totalpage?totalpage:start+stepincre;
          var tempurl = ""
          for(var i=start;i<start+stepincre;i++){    
            var tempurl = urltemplate.replace("{page}", i)
            queue.push(tempurl)

          }
          tempurl = null;
          start = start+stepincre;
          getHtml(queue)
        }
      })
  
}
/*function getimage(url){

  

  var options = {
      host: 'www.google.com'
    , port: 80
    , path: '/images/logos/ps_logo2.png'
  }

  var request = http.get(options, function(res){
      var imagedata = ''
      res.setEncoding('binary')

      res.on('data', function(chunk){
          imagedata += chunk
      })

      res.on('end', function(){
          fs.writeFile('logo.png', imagedata, 'binary', function(err){
              if (err) throw err
              console.log('File saved.')
          })
      })

  })
}*/
crawl()
