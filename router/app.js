const router = require("express").Router();
const api = require("./api");

router.use("/api/yuki", api);

module.exports = router;