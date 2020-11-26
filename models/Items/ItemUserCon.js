const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    itemKY: String,
    userKY: String,
    amount: Number
});

module.exports = mongoose.model("ItemUserCon", userSchema);