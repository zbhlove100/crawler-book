var crypto = require("crypto")
crypto.createHmac('sha1', app_secret).update(args).digest().toString('base64')

var verb = "PUT"

function sign(md5,contentType){
	data = ["PUT", md5, contentType, date.toUTCString(), canonicalHeaders(amzHeaders).join("\n"), "/#{@bucket}/#{resource}"].join("\n")
    crypto.createHmac('sha1', @awsSecret).update(data).digest('base64')
}