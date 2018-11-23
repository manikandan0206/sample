
const express = require('express');
const router = express.Router();
const pdfMake = require('./pdfMake');

router.get('/pdf',function (req,res) {
   res.render('indexx'); 
});

router.post('/pdf',function(req,res){
    var dd = {
        content: [
            "first paragraph"
        ]
    };
    const pdfDoc = pdfMake.createpdf(dd);
    pdfDoc.getBased64(data),function(err){
        res.writeHead(200,
            {
                'content-Type':'application/pdf',
                'content-Disposition':'attachment;filename="filename.pdf"'
            });
        const download = Buffer.from(data.toString('utf-8'),'based64');
        res.end(download);
}
});

module.exports=router;