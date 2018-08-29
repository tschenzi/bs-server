import express from "express";
import * as utils from "./Util/utils.js";
import bodyParser from "body-parser";
import cors from "cors";

var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var router = express.Router();

// router.use(function(req, res, next) {
//     // do logging
//     console.log('Something is happening.');
//     next(); // make sure we go to the next routes and don't stop here
// });

router.get('/', function (req, res)
    {res.json('Hello world!');});

router.route('/placeships').post((req,res) => {

    console.log("post received");
    let obj = req.body;    
    console.log(obj);
    
    let ret = utils.autoShipPlacement(obj.field, obj.shipIndex);
    res.json(ret);
});

app.use("/api", router);

app.listen(3333);
console.log('example app on port 3333');

