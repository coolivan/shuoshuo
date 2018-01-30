var express = require("express");
var app = express();
var router = require("./controller/router");
var session = require('express-session');



app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized:true
}));

app.set("view engine","ejs");
app.use(express.static("./public"));


app.get("/",router.showIndex);
app.get("/regist",router.showRegist);
app.post("/doregist",router.doRegist);
app.get("/login",router.showLogin);
app.post("/dologin",router.doLogin);
app.get("/avatar",router.showAvatar);
app.post("/docut",router.doCut);
app.post("/doupload",router.doUpload);





app.listen(3000);