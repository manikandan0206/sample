const mongoose = require('mongoose');

const mongodbSchema = mongoose.Schema({
    title:{
        type:String
    }
});

const database = module.exports = mongoose.model('database',mongodbSchema);
