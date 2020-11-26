const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number
});

module.exports = mongoose.model("ItemUserCon", userSchema);