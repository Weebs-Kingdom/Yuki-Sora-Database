const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    categoryName: String,
    isNsfw: Boolean
});

module.exports = mongoose.model("TopicCategory", userSchema);