const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'items' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    amount: Number
});

module.exports = mongoose.model("ItemUserCon", userSchema);