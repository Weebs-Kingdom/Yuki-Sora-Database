const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    date: {type: Date, default: Date.now()},
    done: {type: Boolean, default: false},
    task: {type: String, defualt: "{'task': 'empty'}"}
});

module.exports = mongoose.model("YukiTask", taskSchema);