const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    baseDmg: { type: Number, require: true },
    attackName: { type: String, require: true },
    maxUsage: { type: Number, require: true },
    statusEffect: { type: String, require: true },
    attackType: { type: String, require: true }
});

module.exports = mongoose.model("Attack", userSchema);