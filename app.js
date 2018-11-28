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
const passport = require('passport');
const config = require('./config/database');


mongoose.connect(config.database);
const db = mongoose.connection;

//Load view Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

app.use(express.static(path.join(__dirname,'invoice')));

//express message middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
    res.locals.messages=require('express-messages')(req,res);
    res.locals.pdfmail='mani';
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

//passport config
require('./config/passport')(passport);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function (req,res,next) {
    res.locals.user = req.user || null;
    next();
});

// connecting the Db
const sowmi = require('./modules/mongodb');
const user = require('./modules/user');

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
// ------->mail with pdf generator

app.get('/mail',function (req,res) {
   res.render('mail'); 
});

app.post('/mail',function (req,res) {

    const fname = req.body.fname;
    const lname = req.body.lname;

    var documentDefinition =

            `Hello ${fname} ${lname} \n Nice to meet you!`;

    
//----------->generate the pdf file
    
    var pdf = require('pdfkit');
    var pdff = require('pdf');
    var fs = require('fs');
    var myDoc = new pdf;
    
    myDoc.pipe(fs.createWriteStream('node1.pdf'));

    myDoc.font('Times-Roman')
    
        .fontSize(20)
        .text(documentDefinition);
    myDoc.end();
//----------->

  console.log(req.body.mail);
    var output= `<center><b><h2 style="color:white;background-color: #437fe0">Namakkal Property!</h2><p>Hai,Manikandan</p><p>Free Billing Statment.</p></center>
                                    <p >Name:${fname}</p>
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
//----------->new video for html to pdf

const pdfRoute = require('./routes/pdfMake');
app.use('/pdfMake', pdfRoute);

// we have use routes - pdfMake.js
// we have get and post page as indexx.pug

//------------>

//----------------> code for image upload using multer in within application
var multer = require('multer');
// Set the storage engine
var storage = multer.diskStorage({
    destination:'./public/uploads/',
    filename: function (req,file,cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
var upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('myImage');

// Check File Type
function checkFileType (file, cb){
// Allowed ext
    const filetypes = /jpeg|jpg|png/;
// Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
// Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    } else {
        cb('Error: Images Only!');
    }
}
// public folder
app.use(express.static('./public'));
app.get('/uploads',function (req,res) {
   res.render('uploads'); 
});
// upload page post
app.post('/uploads', function(req, res) {
    upload(req, res, function (err) {
        if(err){
            res.render('login', {
                msg: err
            });
        } else {
            if(req.file == undefined){
                res.render('uploads', {
                    msg: 'Error: No File Selected!'
                });

            } else {
                res.render('uploads', {
                    msg: 'File Uploaded!',
                    file: `uploads/${req.file.filename}`
                });

                req.flash("success", 'Uploaded successfully!!');
            }
        }
    });
});
//------------->
var users=require('./routes/users');
app.use('/users',users);


app.listen(3000, function(){
    console.log('server started on port 3000...');
});

