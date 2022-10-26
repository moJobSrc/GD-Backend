const auth = require('./encrypt');
const db = require('./db');

function yyyymmdd() {
    var d = new Date(), // Convert the passed timestamp to milliseconds
    yyyy = d.getFullYear(),
    mm = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
    dd = ('0' + d.getDate()).slice(-2),         // Add leading 0.
    hh = d.getHours(),
    h = hh,
    min = ('0' + d.getMinutes()).slice(-2),     // Add leading 0.
    time;
        
    // if (hh > 12) {
    //     h = hh - 12;
    //     ampm = 'PM';
    // } else if (hh === 12) {
    //     h = 12;
    //     ampm = 'PM';
    // } else if (hh == 0) {
    //     h = 12;
    // }
    
    // ie: 2013-02-18, 8:35 AM  
    time = yyyy + '년 ' + mm + '월 ' + dd + '일 ' + h + ':' + min;// + ' ' + ampm;
        
    return time;
}


const bbsWrite = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split('Bearer ') [1]; // header에서 access token을 가져옵니다.
        const result = auth.verify(token); // token을 검증합니다.
        // console.log(result)
        if (result.ok) { // token이 검증되었으면 req에 값을 세팅하고, 다음 콜백함수로 갑니다.
            db.query(`SELECT id FROM community ORDER BY id DESC`, function(err, results) {
                var bbsId = 0
                try {
                    bbsId = parseInt(results[0].id) + 1
                } catch (error) {
                    if (error === TypeError) {
                        bbsId = 0
                    }
                }
                const title = req.query.title
                const content = req.query.content
                const image = req.query.image
                console.log(req.query)
                if (title && content) {
                    db.query(`INSERT INTO community (id, title, author, date, content, uuid, image, gaechu, beechu, seen) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0);`,[bbsId, title, result.username, yyyymmdd(), content, result.uuid, image || ""], function(err, insertResult) {
                        if (err) {
                            res.status(500).send({
                                status: 500,
                                message: "Internal Server Error",
                                ok: false
                            })
                            console.log(err.message)
                        } else {
                            res.status(200).send({
                                status: 200,
                                message: "글 작성을 성공했습니다",
                                ok: true,
                                bbsId: bbsId
                            })
                        }
                    })
                } else {
                    res.status(601).send({
                        status: 601,
                        ok: false,
                        message: "NO ARGUMENT"
                    })
                }
            })
        } else { // 검증에 실패하거나 토큰이 만료되었다면 클라이언트에게 메세지를 담아서 응답합니다.
            res.status(401).send({
                status: 401,
                ok: false,
                message: "글쓰기 권한이 없습니다.", // jwt가 만료되었다면 메세지는 'jwt expired'입니다.
            });
        }
    } else {
        res.status(401).send({
            status: 401,
            ok: false,
            message: "글쓰기 권한이 없습니다.", // jwt가 만료되었다면 메세지는 'jwt expired'입니다.
        });
    }
};

module.exports = bbsWrite;