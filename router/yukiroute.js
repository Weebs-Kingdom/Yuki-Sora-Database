const router = require("express").Router();
const schedule = require('node-schedule');

//middleware
const verify = require("../middleware/verifyApiToken");

const fetch = require('node-fetch');

class Route {

    constructor(route, mod) {
        router.get("/" + route, verify, async (req, res) => {
            const id = req.query.id;
            let data;
            if (id) {
                data = await mod.findOne({_id: id});
            } else {
                data = await mod.find({});
            }

            if (data)
                return res.status(200).json({status: 404, message: "The data can't be found!", data: []});
            else
                return res.status(200).json({status: 200, message: "Found data!", data: data});
        });

        router.post("/" + route, verify, async (req, res) => {
            let data = new mod(req.body);
            data = await data.save();

            if (!data)
                return res.status(200).json({status: 404, message: "The data can't be found!", data: []});
            else
                return res.status(200).json({status: 200, message: "Found data!", data: data});
        });

        router.patch("/" + route, verify, async (req, res) => {
            const id = req.query.id;
            let data;
            if (id) {
                data = await mod.updateOne({_id: id}, {$set: req.body});
            }

            if (!data)
                return res.status(200).json({status: 404, message: "The data can't be found!", data: []});
            else {
                data = await mod.findOne({_id: id});
                return res.status(200).json({status: 200, message: "Found data and updated!", data: data});
            }
        });

        router.delete("/" + route, verify, async (req, res) => {
            const id = req.query.id;
            let data;
            if (id) {
                data = await mod.deleteOne({_id: id});
            }

            if (!data)
                return res.status(200).json({status: 404, message: "The data can't be found!", data: []});
            else
                return res.status(200).json({status: 200, message: "Found data and deleted!", data: data});
        });
    }
}

module.exports = function (routeinfo){
    new Route(routeinfo.route, routeinfo.module)
    return router;
}

//module.exports = router;