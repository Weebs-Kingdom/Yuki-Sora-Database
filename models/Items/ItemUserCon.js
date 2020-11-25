const mongoose = require("mongoose");
const User = require("../User");
const Item = require("./Item");

const userSchema = new mongoose.Schema({
    item: Item,
    user: User,
    amount: Number
});

module.exports = mongoose.model("ItemUserCon", userSchema);