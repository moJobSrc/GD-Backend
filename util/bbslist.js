const auth = require('./encrypt');
const db = require('./db');

const bbslist = (req, res, next) => {
    const pages = req.query.page
    if (pages) {
        const page = pages*15
        db.query(`SELECT * FROM community ORDER BY id DESC LIMIT ?,?`,[page-15, page], function(err, results) { // 한페이지당 15개씩 가져오기
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
                    bbslist: dataList
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

module.exports = bbslist;