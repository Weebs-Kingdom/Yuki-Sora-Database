const mongoose = require("mongoose");

module.exports.connect = function () {
    let c = mongoose.connect(process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }).then(
        () => {
            console.log("Connected to DB")
        },
        err => {
            console.log(err)
        }
    );
}