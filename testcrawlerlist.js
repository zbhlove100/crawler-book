var Crawler = require("crawler").Crawler;
var c = new Crawler({
	jQuery: true,
"maxConnections":10,

// This will be called for each crawled page
"callback":function(error,result,$) {

    // $ is a jQuery instance scoped to the server-side DOM of the page
    console.log("1111111111")
}
});
function test(){
	for(var i=0;i<100000;i++){
		c.queue("http://182.92.192.217");
	}
}
test()