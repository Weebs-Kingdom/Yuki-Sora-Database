const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    code: String,
    instructions: String,
    hasMaxUsage: Boolean,
    doExpire: Boolean,
    expires: Date,
    autoDelete: Boolean,
    maxUsage: {type: Number, default: 0},
    maxUserUsage: {type: Number, default: 1},
    used: {type: Number, default: 0}
});

module.exports = mongoose.model("RedeemCode", userSchema);