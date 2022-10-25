const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    attack: {type: mongoose.Schema.Types.ObjectId, require: true},
    monster: {type: mongoose.Schema.Types.ObjectId, require: true},
    level: {type: Number, require: true}
});

module.exports = mongoose.model("AttackMonsterCon", userSchema);