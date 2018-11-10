const mongoose = require('mongoose');

const mongodbSchema = mongoose.Schema({
    name:{
        type:String
    }
});

const database = module.exports = mongoose.model('database',mongodbSchema);
