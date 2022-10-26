var db = require('./db');
var encrypt = require('./encrypt');
var crypto = require('crypto');
var uid = require('uuid');

module.exports = {
    login : function(userId, password, callback) {
        //유저 아이디로 password,salt,uuid를 가져옴
        db.query(`SELECT username,password,salt,uuid FROM users WHERE username = ?`,[userId], function(err, results) {
            //정보 EXIST 확인 0 : 1
            if (results.length == 1) {
                console.log(results[0])
                //비밀번호 암호화
                crypto.pbkdf2(password, results[0].salt, parseInt(process.env.REPEAT_NUM), 64, 'sha512', (err, key) => {
                    //비밀번호가 같은지 확인
                    if (results[0].password == key.toString(`base64`)) {
                        //db에서 uuid를 가져와 payload 구현
                        const payload = {
                            iss: "gudeok.com",
                            username: userId,
                            uuid: results[0].uuid
                        };
                        //토큰 발급
                        const accessToken = encrypt.sign(payload);
                        callback(err,{ // client에게 토큰 모두를 반환합니다.
                            status: 200,
                            message: "로그인 성공",
                            accessToken
                        });
                    } else {
                        //비밀번호 불일치
                        callback(err, {
                            status: 401,
                            message: '로그인 실패'
                        })
                    }
                })
            } else {
                //유저 정보 없음
                callback(err, {
                    status: 401,
                    message: '로그인 실패'
                })
            }
        })
    },
    register : function(userId, password, callback) {
        try {
            crypto.randomBytes(64, (err, buf) => {
                const repeat_num = parseInt(process.env.REPEAT_NUM)
                crypto.pbkdf2(password, buf.toString('base64'), repeat_num, 64, 'sha512', (err, key) => {
                    //console.log(key.toString('base64')); // 비밀번호
                    const uuid = uid.v4()
                    const payload = {
                        iss: "gudeok.com",
                        username: userId,
                        uuid: uuid
                    };
    
                    //토큰 발급 필요 X 로그인부분에서 발급예정
                    const salt = buf.toString('base64')
                    const pw = key.toString('base64')
                    const refresh = encrypt.refresh(payload)
    
                    db.query(`SELECT EXISTS (SELECT * FROM users where username = ? ) as success;`,[userId],function(err,results) {
                        //중복 확인 success 0 ?: 1
                        console.log({
                            name:userId,
                            dupeCheck:results[0].success
                        })
                        if (!results[0].success) {
                            db.query(`INSERT INTO \`users\` (\`username\`, \`password\`, \`salt\`, \`uuid\`, \`refreshToken\`) VALUES (?, ?, ?, ?, ?);`,[userId, pw, salt ,uuid ,refresh], (err, result) => {
                                callback(err, {status:201, message: "회원가입이 성공적으로 되었습니다.", username:userId})
                            })
                        } else {
                            callback(err, {status:400, message: "중복된 아이디로 가입되어있습니다.", username:userId})
                        }
                    })
                });
            });
        } catch (error) {
            callback(error, {status:500, message: "내부 서버 에러"})
        }
    }
}