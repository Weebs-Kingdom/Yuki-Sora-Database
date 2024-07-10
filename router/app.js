const router = require("express").Router();
const api = require("./api");
const yuki = require("./yuki");

router.use('/api/yuki', api);

router.use('/yuki-api', yuki);

router.get('/', async (req, res) => {
    res.status(200).send({})
})

module.exports = router;