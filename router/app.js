const router = require("express").Router();
const api = require("./api");
const yuki = require("./yuki");

router.use('/api/yuki', api);

router.use('/yuki-api', yuki);

module.exports = router;