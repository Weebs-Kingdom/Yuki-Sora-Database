const mongoose = require("mongoose");
const User = require("../User/User");
const Attack = require("./Attack");
const Monster = require("./Monster");
const MonsterEvolveCon = require("./MonsterEvolveCon");

const userSchema = new mongoose.Schema({
    rootMonster: Monster,
    a1: Attack,
    a2: Attack,
    a3: Attack,
    a4: Attack,
    level: Number,
    xp: Number,
    dv: Number,
    baseHP: Number,
    hp: Number,
    maxHp: Number,
    evolveDirection: String,
    user: User
});

module.exports = mongoose.model("UserMonster", userSchema);