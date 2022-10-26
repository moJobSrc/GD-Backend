const auth = require('../util/encrypt');
var db = require('./db');

const authJWT = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split('Bearer ') [1]; // header에서 access token을 가져옵니다.
        const result = auth.verify(token);
        try {
            // console.log(result)
            if (result.ok) { // token이 검증되었으면 req에 값을 세팅하고, 다음 콜백함수로 갑니다.
                // req.username = result.username;
                // req.role = result.role;
                // next();
                db.query(`SELECT EXISTS (SELECT * FROM users where uuid = ? ) as success;`,[result.uuid],function(err,results) {
                    if (err) {
                        console.log(err)
                        res.status(401).send({
                            ok: false,
                            message: "Internal Server Error"
                        });
                    } else {
                        //중복 확인 success 0 ?: 1
                        if (results[0].success) {
                            res.json(result)    
                        } else {
                            res.status(401).send({
                                ok: false,
                                message: "Auth null",
                            });
                        }
                    }
                })
            } else { // 검증에 실패하거나 토큰이 만료되었다면 클라이언트에게 메세지를 담아서 응답합니다.
                res.status(401).send({
                    ok: false,
                    message: result.message, // jwt가 만료되었다면 메세지는 'jwt expired'입니다.
                });
            }
        } catch (error) {
            res.status(401).send({
                ok: false,
                message: result.message, // jwt가 만료되었다면 메세지는 'jwt expired'입니다.
            });
        }
    } else {
        res.status(401).send({
            ok: false,
            message: "Token is null"
        });
    }
};

module.exports = authJWT;