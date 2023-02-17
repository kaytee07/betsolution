const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    type:String,
    image: [ {
            url:String,
            filename:String,
        }]
    
})

module.exports = mongoose.model('Image', imageSchema);
