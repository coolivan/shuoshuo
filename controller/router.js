var fs = require("fs");
var formidable =  require("formidable");
var db = require("../models/db.js");
var md5 = require("../models/md5");
var gm = require('gm');
var path = require('path');

exports.showIndex = function(req,res,next){
    if(req.session.login == 1){
        var login = true;
        var username = req.session.username;
    }else {
        var login = false;
        var username = "";
    }

    db.find('users',{"username": username},function (err,result) {
        if(result.length == 0){
            var avatar = "default.jpg";
        }else {
            var avatar = Boolean (result[0].avatar) ? result[0].avatar : "default.jpg";
        }
        res.render("index",{
            "login": login,
            "username": username,
            "avatar":  avatar,
        });
    });

};

exports.showRegist = function(req,res,next){
    res.render("regist",{
        "login":req.session.login == "1" ? true : false,
        "username": req.session.username
    });
};

exports.doRegist = function (req,res,next) {
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        var username = fields.username;
        var password = md5(md5(fields.password)+"ivan");

        db.find("users",{"username":username},function (err,result) {
            if(err){
                res.send("-4");//服务器错误
                return;
            }
            if(result.length != 0){
                res.send("-1");//被占用
                return;
            }

            db.insertOne("users",{"username":username,"password":password,"avatar":"default.jpg"},function (err,result) {
                if(err){
                    res.send("-4");//服务器错误
                    return;
                }
                req.session.login = 1;
                req.session.username = username;
                res.send("1");
            })
        })
    });
}

exports.showLogin = function(req,res,next){
    res.render("login",{
        "login":req.session.login == "1" ? true : false,
        "username": req.session.username
    })
};

exports.doLogin = function (req,res,next) {
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        var username = fields.username;
        var password1 = md5(md5(fields.password)+"ivan");



        db.find("users",{"username":username},function (err,result) {
            if(err){
                req.send("-4")//系统错误
                return;
            }
            if(result.length == 0){
                req.send("-2");//用户不存在
                return;
            }

            if(result.length != 0){
                var password2 = result[0].password;
                if(password1 != password2){
                    res.send("-1");//密码错误
                    return;
                }
                req.session.login = 1;
                req.session.username = username;
                res.send("1");
            }
        })
    })
};

exports.showAvatar = function (req,res,next) {
    if(req.session.login == 1){
        var login = true;
        var username = req.session.username;
    }else {
        var login = false;
        var username = "";
        res.send("请登录！");
        return;
    }
    db.find('users',{"username": username},function (err,result) {
        if(result.length == 0){
            var avatar = "default.jpg";
        }else {
            var avatar = Boolean (result[0].avatar) ? result[0].avatar : "default.jpg";
        }
        req.session.avatar = avatar;
        res.render("avatar",{
            "login": login,
            "username": username,
            "avatar":  avatar,
        });
    });

};


exports.doUpload = function (req,res,next) {
    var form = new formidable.IncomingForm({
        encoding:"utf-8",
        uploadDir:"./public/avatars",  //文件上传地址
        keepExtensions:true  //保留后缀
    });

    form.parse(req, function(err, fields, files,next) {
        if(err){
            next();
            return;
        }
        var oldpath = files.file.path;
        var newpath = './public/avatars/' + req.session.username + path.extname(files.file.name);
        fs.rename(oldpath,newpath,function (err){
            if(err){
                res.send("-1");
                return;
            }
            req.session.avatar = path.win32.basename(newpath);
            res.send("1");
        })
    });
};

exports.doCut = function (req,res,next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        var x = fields.x, y = fields.y, w = fields.w, h = fields.h;
        var src = req.session.avatar;
        // console.log(src);
        if(!src){
            res.send("-2");
            return;
        }

        gm("./public/avatars/" + src)
            .crop(w, h,x, y)
            .resize(100, 100, '!')
            .write("./public/avatars/" + src, function (err) {
                if(err){
                    res.send("-1");
                    console.log(err);
                    return;
                }

                db.updateMany("users",{"username": req.session.username},{$set:{"avatar": src}},function (err,result) {
                    if(err){
                        res.send("-3");
                        return;
                    }
                });
                // res.send("1");
                res.redirect("/");
            });
    });
};




