const mongoose = require("mongoose");
const User = require("../User");
const Item = require("./Item");

const userSchema = new mongoose.Schema({
    item: Schema.Types.ObjectId,
    user: Schema.Types.ObjectId,
    amount: Number
});

module.exports = mongoose.model("ItemUserCon", userSchema);