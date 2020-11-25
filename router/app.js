const router = require("express").Router();
const auth = require("./api");

router.use("/api/yuki", auth);

module.exports = router;