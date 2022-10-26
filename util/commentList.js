const auth = require('./encrypt');
const db = require('./db');

const commentList = (req, res, next) => {
    const postId = req.query.postId
    if (postId) {
        db.query(`SELECT * FROM comment WHERE post_id=?`,[postId], function(err, results) {
            if (err) {
                console.log(err)
                res.status(500).send({
                    status: 500,
                    message: "Internal Server Error",
                    ok: false
                })
            } else {
                var dataList = [];
                console.log(results.length)
                if (results.length == 0) {
                    dataList = null
                } else {
                    for (var data of results){
                        dataList.push(data);
                      };
                }
                res.status(200).send({
                    status: 200,
                    ok: true,
                    commentList: dataList
                })
            }
        })
    } else {
        res.status(601).send({
            status: 601,
            ok: false,
            message: "Need PostId"
        })
    }
};

module.exports = commentList;