const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash=require('connect-flash');
var expressValidator=require('express-validator');
var expressmessages = require('express-messages');

mongoose.connect('mongodb://Localhost:27017/nodekb');
const db = mongoose.connection;

//Load view Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//express message middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
    res.locals.messages=require('express-messages')(req,res);
    next();
});

//express session middleware
app.use(session({
    secret:'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express validator middleware
app.use(expressValidator({
    errorFormatter:function (param,msg,value) {
        var namespace=param.split('.'),
            roor=namespace.shift(),
            formParam=root;
        while(namespace.length){
            formParam+='[' + namespace.shift() + ']';
        }
        return{
            param:formParam,
            msg:msg,
            value:value
        };
    }
}));

// connecting the Db
const sowmi = require('./modules/mongodb');

//middle ware for body parser
app.use(bodyParser.urlencoded({extended:false}));

//parser application/json
app.use(bodyParser.json());

app.get('/',function(req,res){
    sowmi.find({},function (err,result) {
        
    res.render('index',{title:result});
});
});

app.get('/next',function (req,res) {
   res.render('next'); 
});

app.post('/next',function (req,res) {
    console.log(req.body.Name);
    var db = new sowmi();
    db.name = req.body.Name;
    db.save(function(err){
       if(err){
           console.log("err");
           return;
       }
        else{
           req.flash('success','Your are saved');
           res.redirect('/');
       }
    });
});


app.listen(3000, function(){
    console.log('server started on port 3000...');
});

