const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
mongoose.connect('mongodb://localhost/nodekb');
const db = mongoose.connection;

//Load view Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

// connecting the Db
const mongodblist = require('./modules/mongodb');

//middle ware for body parser
app.use(bodyParser.urlencoded({extended:false}));

//parser application/json
app.use(bodyParser.json());

app.get('/',function(req,res){
    mongodblist.find({},function (err,result) {
    res.render('index',{title:result});
});
});

app.get('/next',function (req,res) {
   res.render('next'); 
});

app.post('/next',function (req,res) {
    var db = new mongodblist();
    db.title = req.body.Name;
    db.save(function(err){
       if(err){
           console.log("err");
           return;
       }
        else{
           res.redirect('/');
       }
    });
});


app.listen(3000, function(){
    console.log('server started on port 3000...');
});

