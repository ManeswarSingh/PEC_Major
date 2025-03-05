const { Schema, model } = require('mongoose');
const tweetSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content:{
        type: String,
        required:true
    } ,
    image: { type: String },
    timestamp: { type: Date, default: Date.now }
});

const Tweet = model("Tweet", tweetSchema);
module.exports = Tweet