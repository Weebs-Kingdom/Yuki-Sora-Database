const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    itemKY: mongoose.Schema.Types.ObjectId,
    userKY: mongoose.Schema.Types.ObjectId,
    amount: Number
});

module.exports = mongoose.model("ItemUserCon", userSchema);