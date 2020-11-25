const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    baseDmg: Number,
    attackName: String,
    level: Number,
    maxUsage: Number,
    statuseffect: String
});

module.exports = mongoose.model("Attack", userSchema);