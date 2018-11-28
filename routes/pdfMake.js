const express = require('express');
const router = express.Router();
var nodemailer = require('nodemailer');
var mailer = require('express-mailer');
const pdfMake = require('../pdfmake/pdfmake');
const vfsFonts = require('../pdfmake/vfs_fonts');

pdfMake.vfs = vfsFonts.pdfMake.vfs;

router.get('/pdf', (req, res)=>{
    res.sendfile('pdf.html');
});

router.post('/pdf',function (req,res) {
    const fname = req.body.fname;
    const lname = req.body.lname;

    var documentDefinition = {
        content: [
            `Hello ${fname} ${lname}` ,
            'Nice to meet you!'
        ]
    };
    const pdfDoc = pdfMake.createPdf(documentDefinition);
    pdfDoc.getBase64((data)=> {
        res.writeHead(200,
            {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment;filename="Invoice.pdf"'
            });
        const download = Buffer.from(data.toString('utf-8'), 'base64');
        res.end(download);
        // console.log(Buffer.from(data.toString('utf-8'), 'base64'));
        // console.log(pdfDoc);
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
            html: documentDefinition,
            attachments: [{
                filename: 'Invoice.pdf',
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
});


module.exports = router;