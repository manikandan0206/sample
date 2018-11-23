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
var nodemailer = require('nodemailer');
var mailer = require('express-mailer');
mongoose.connect('mongodb://Localhost:27017/nodekb');
const db = mongoose.connection;

//Load view Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

app.use(express.static(path.join(__dirname,'invoice')));


//----------->generate the pdf file
var pdf = require('pdfkit');
var pdff = require('pdf');
var fs = require('fs');

var myDoc = new pdf;

myDoc.pipe(fs.createWriteStream('node1.pdf'));

myDoc.font('Times-Roman')
    .fontSize(48)
    .text('NodeJS PDF Document',100,100);

myDoc.end();
//----------->

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
        console.log(__dirname+'/node.pdf');
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
// mail

app.get('/mail',function (req,res) {
   res.render('mail'); 
});

app.post('/mail',function (req,res) {
//----------->generate the pdf file
    var pdf = require('pdfkit');
    var pdff = require('pdf');
    var fs = require('fs');

    var myDoc = new pdf;

    myDoc.pipe(fs.createWriteStream('node1.pdf'));

    myDoc.font('Times-Roman')
        .fontSize(24)
        .text('Namakkal property totally free for the First Month',100,100);
    myDoc.end();
//----------->

  console.log(req.body.mail);
    var output= `<center><b><h2 style="color:white;background-color: #437fe0">Namakkal Property!</h2><p>Hai,Manikandan</p><p>Free Billing Statment.</p></center>
                                    <p >Name:Manikandan</p>
                                    <p >Property Name:MK Builder's</p>
                                    <p >organization Name:National Property Private Limited Company</p>
                                    <hr>
                                    <p>Invoice for the First month</p>
                                    <p>Bill amoount:0.0 &#8377;</p>
                                    <p>GST percentage:0.0 &#8377;</p>
                                    <p><b>Total amount:0.0 &#8377;</b></p>
                                    </b>`
    var transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'info@mealsday.com',
            pass: 'MdC-NKX-D8r-Xam1#'
        }
    });
    
    // setup e-mail data, even with unicode symbols
    var mailOptions = {
        from: '"INVOICE - Namakkal Property " <info@mealsday.com>',
        to: req.body.mail,
        subject: 'Namakkal - INVOICE ',
        text: 'PDF attachment',
        html: output,
        attachments: [{
            filename: 'file.pdf',
            path: __dirname+'/node1.pdf',
            contentType: 'application/pdf'
        }]
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.messageId);
        req.flash('success', 'mail sent');
        res.redirect('/');

    });
});

const pdfRoute = require('./routes/pdfmake');
app.use('/pdfMake',pdfRoute);


app.listen(3000, function(){
    console.log('server started on port 3000...');
});

