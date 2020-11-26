const mongoose = require("mongoose");
const User = require("../User/User");
const Attack = require("./Attack");
const Monster = require("./Monster");
const MonsterEvolveCon = require("./MonsterEvolveCon");

const userSchema = new mongoose.Schema({
    rootMonster: Monster,
    a1: Schema.Types.ObjectId,
    a2: Schema.Types.ObjectId,
    a3: Schema.Types.ObjectId,
    a4: Schema.Types.ObjectId,
    level: Number,
    xp: Number,
    dv: Number,
    baseHP: Number,
    hp: Number,
    maxHp: Number,
    evolveDirection: String,
    user: Schema.Types.ObjectId
});

module.exports = mongoose.model("UserMonster", userSchema);