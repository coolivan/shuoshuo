var MongoClient = require("mongodb").MongoClient;
var config = require("../config.js");

function _connectDB(callback){
    var url = config.dburl;

    MongoClient.connect(url,function(err,db){
        if(err){
            callback(err,null);
            return;
        }
        callback(err,db);
    })
}

exports.insertOne = function(collectionName, json, callback){
    _connectDB(function(err,db){
        if(err){
            callback(err,db);
            return;
        }
        db.collection(collectionName).insertOne(json, function(err,result){
            callback(err, result);
            db.close();
        })
    })
}

exports.find = function(collectionName,json, c, d){//args = {"pageAmount":10,"pageNum":10}
    var result = [];
    if(arguments.length == 3){
        var callback = c;
        var skip = 0;
        var limit = 0;
    }else if(arguments.length == 4){
        var callback = d;
        var args = c;
        var skip = args.pageAmount * args.page || 0;
        var limit = args.pageAmount || 0;
        var sort = args.sort || {};
    }else{
        throw new Error("find的参数必须是3个，或4个");
        return;
    }

    _connectDB(function(err,db){
        var cursor = db.collection(collectionName).find(json).skip(skip).limit(limit).sort(sort);
        cursor.each(function(err,doc){
            if(err){
                callback(err,null);
                db.close();
                return;
            }
            if(doc != null){
                result.push(doc);
            }else{
                callback(null,result);
                db.close();
            }
        })
    })
}

exports.deleteMany = function(collectionName, json, callback){
    _connectDB(function(err, db){
        db.collection(collectionName).deleteMany(
            json,
            function(err, results){
                callback(err, results);
                db.close();
            }
        )
    })
}

exports.updateMany = function (collectionName,json1,json2,callback) {
    _connectDB(function (err,db) {
        db.collection(collectionName).updateMany(
            json1,
            json2,//{$set:{k:v}}
            function (err,results) {
                callback(err,results);
                db.close();
            }
        )
    })
}

exports.getAllCount = function (collectionName,callback) {
    _connectDB(function (err,db) {
        db.collection(collectionName).count({}).then(function (count) {
            callback(count);
            db.close();
        })
    })
}