var express = require("express");
var router = express.Router();
var fs = require('fs');
var db = require('../util/db');
var encrypt = require('../util/encrypt');
var auth = require('../util/auth');
var authJWT = require('../util/authJWT');
var refresh = require('../util/refresh');
var checkName = require('../util/checkName.js');
require("dotenv").config();
// var cors = require('cors');
const app = require("../app");
const bbslist = require("../util/bbslist");
const bbsWrite = require("../util/postWrite");
const commentWrite = require("../util/commentWrite");
const commentList = require("../util/commentList");
const bbsGet = require("../util/postGet");

// app.use(cors)

/* GET users listing. */
router.get("/", function (req, res, next) {
    res.status(404).send("NOTHING HERE :(");
});

router.all("/check", authJWT);

router.all("/usernameCheck", checkName)

router.all("/bbslist", bbslist)
router.all("/bbsGet", bbsGet)
router.all("/bbsWrite", bbsWrite)
router.all("/commentWrite", commentWrite)
router.all("/commentlist", commentList)

router.all("/checkR", refresh)

router.all("/login", function (req, res) {

    // const payload = {
    //     iss: "dongjutoto.com",
    //     "https://dongjutoto.com/is_admin": true,
    //     userId: "11028373727102",
    //     username: "dmsghekdzh",
    //     role: 'admin'
    // };
    const id = req.query.id
    const pw = req.query.pw
    if (id && pw) {
        console.log(req.query)
        auth.login(id, pw, (err,results) => {
            if (err) {
                res.status(404).send(err);
            } else {
                try {
                    res.status(200).send(results)
                    return true;
                } catch (err) {
                    return false;
                }
            }
        })
    } else {
        res.status(500).send('Need Argument');
    }

    // res.send(token);
});

router.all("/register", function (req, res) {
    console.log(req.body)
    const id = req.query.id
    const pw = req.query.pw
    if (id && pw) {
        console.log(req.query)
        auth.register(id,pw, (err, results) => {
            if (err) {
                res.status(401).send({
                    "status" : 401,
                    "message": "내부 에러가 발생했습니다"
                });
                console.log(err);
            } else {
                res.send(results);
            }
        })
    } else {
        res.status(500).send('Need Argument');
    }

});

module.exports = router;
