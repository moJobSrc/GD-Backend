const { sign, verify, refreshVerify } = require('./encrypt');
const jwt = require('jsonwebtoken');
const db = require('./db')

const refresh = async (req, res) => {
    // access token과 refresh token의 존재 유무를 체크합니다.
    if (req.headers.authorization) {
        const authToken = req.headers.authorization.split('Bearer ')[1];
        // access token 검증 -> expired여야 함.
        const authResult = verify(authToken);

        // access token 디코딩하여 user의 정보를 가져옵니다.
        const decoded = jwt.decode(authToken);
        
        // 디코딩 결과가 없으면 권한이 없음을 응답.
        // if (decoded === null) {
        //     res.status(401).send({
        //         ok: false,
        //         message: 'No authorized!',
        //     });
        // }
        //access token 검증
        if (authResult.ok === false && authResult.message === 'jwt expired') {
            db.query(`select resfreshToken from users where username = '${decoded.username}';`, function(err, results) {
                const refreshToken = results[0].rfToken;
                //refresh Token 검증
                const refreshResult =refreshVerify(refreshToken)
                if (refreshToken.ok === false && authResult.message === 'jwt expired') {
                    //모두 만료된 경우
                    res.status(401).send({
                        ok: false,
                        message: 'No authorized!',
                    })
                } else {
                    // 2. access token이 만료되고, refresh token은 만료되지 않은 경우 => 새로운 access token을 발급
                    const newAccessToken = sign({
                        "iss": "dongjutoto.com",
                        "username": decoded.username,
                        "role": decoded.role,
                    });

                    res.status(200).send({ // 새로 발급한 access token과 원래 있던 refresh token 모두 클라이언트에게 반환합니다.
                        ok: true,
                        data: {
                            accessToken: newAccessToken
                        },
                    });
                }
            });
        } else if (decoded === null) {
            res.status(401).send({
                ok: false,
                message: 'No authorized!',
            });
        } else {
            //만료 되지 않음
            res.status(200).send({
                ok: true,
                message: 'Access Token is not expired'
            })
        }
    } else {
        res.status(401).send({
            ok: false,
            message: 'No Have Access Token'
        })
    }
};

module.exports = refresh;