const auth = require('./encrypt');
const db = require('./db');

const bbsGet = (req, res, next) => {
    const id = req.query.id
    if (id) {
        db.query(`SELECT * FROM community WHERE id=?`,[id], function(err, results) {
            if (err) {
                console.log(err)
                res.status(500).send({
                    status: 500,
                    message: "Internal Server Error",
                    ok: false
                })
            } else {
                db.query(`UPDATE community SET seen=seen+1 WHERE id=?`,[id],function(err, seenResult) {
                    // console.log(seenResult)
                    res.status(200).send({
                        status: 200,
                        ok: true,
                        post: results[0]
                    })
                })
            }
        })
    } else {
        res.status(200).send({
            status: 500,
            ok: false,
            message: "Need Page"
        })
    }
};

module.exports = bbsGet;