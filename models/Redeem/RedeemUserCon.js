const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    used: {type: Number, default: 0},
    redeemCode: mongoose.Schema.Types.ObjectId,
    user: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model("RedeemUserCon", userSchema);