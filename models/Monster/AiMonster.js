const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    rootMonster: {type: mongoose.Schema.Types.ObjectId, require: true},
    level: {type: Number, default: 1},
    dv: {type: Number, require: true},
    hp: {type: Number, require: true},
    maxHp: {type: Number, require: true},
    user: {type: mongoose.Schema.Types.ObjectId, require: true},
    statusEffect: {type: String, require: true}
});

module.exports = mongoose.model("AiMonster", userSchema);