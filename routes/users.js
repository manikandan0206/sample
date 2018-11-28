const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const flash = require('connect-flash');
const expressmessages = require ('express-messages');
const expressValidator = require ('express-validator');
const bodyParser = require('body-parser');
const session = require ('express-session');
const nodemailer = require('nodemailer');


//Bring in user module
var User = require('../modules/user');

//register form
router.get('/register',function (req,res) {
    res.render('register');
});

//login page
router.get('/login',function (req,res) {
    res.render('login');
});

//login process
router.post('/login', function(req,res,next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req,res,next);
});


//Register process
router.post('/register',function (req,res) {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const confirm = req.body.confirm;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('username', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Invalid Email').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('confirm', 'Confirm password is required').notEmpty();
    req.checkBody('confirm', 'Password is not matched').equals(req.body.password);


    var errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors
        });
    }
    else {
        var newUser = new User({
            name: name,
            email: email,
            password: password,
            confirm:confirm,
            username:username
        });
        bcrypt.genSalt(10,function (err,salt) {
            bcrypt.hash(newUser.password,salt,function (err,hash) {
                if(err){
                    console.log(err);
                }
                newUser.password =hash;
                newUser.save(function (err) {
                    if (err) {
                        console.log(err);
                    }else {
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
                            from: '"New user " <info@mealsday.com>',
                            to: email,
                            subject: 'New user ',
                            text: 'Welcome'
                        };

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Message sent: ' + info.messageId);


                            req.flash('success', 'Registration Successful');
                            res.redirect('/users/login');

                        });
                    }
                });
            });

        });
    }
});
// Logout Process
router.get('/logout',function(req,res){
    req.logOut();
    req.flash('success','You are logged out');
    res.redirect('/users/login');
});
module.exports = router;