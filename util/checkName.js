var db = require("../util/db")

const checkName = (req, res, next) => {
    if (req.query.id) {
        db.query(`SELECT EXISTS (SELECT * FROM users where username = ?) as success;`,[req.query.id],function(err,results) {
            //로그인 확인 success 0 ?: 1
            console.log('login check :', results[0].success)
            if (!results[0].success) {
                res.status(200).send({
                    status:200,
                    message: "중복된 아이디가 없습니다.",
                    ok:true
                })
            } else {
                res.status(401).send({
                    status:401,
                    message: "중복된 아이디가 있습니다.",
                    ok:false
                })
            }
        })
    } else {
        res.status(500).send("Need Argument")
    }
};

module.exports = checkName;