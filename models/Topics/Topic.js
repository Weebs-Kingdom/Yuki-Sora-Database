const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    topic: String,
    description: String,
    category: [mongoose.Schema.Types.ObjectId]
});

module.exports = mongoose.model("Topic", userSchema);