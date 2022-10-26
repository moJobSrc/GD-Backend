var jwt = require('jsonwebtoken')
var db = require('./db');
const { promisify } = require('util')
const crypto = require('crypto');

module.exports = {
    sign : function(payload) {
        const privateKey = process.env.RSA_PRIVATE_KEY;
        //token 만료일 100일
        return token = jwt.sign(payload, privateKey, {
            algorithm: 'HS256',
            expiresIn: "100d",
        });
    },
    verify: (token) => { // access token 검증
        const privateKey = process.env.RSA_PRIVATE_KEY;

        let decoded = null;
        try {
          decoded = jwt.verify(token, privateKey);
          return {
            ok: true,
            username: decoded.username,
            uuid: decoded.uuid,
          };
        } catch (err) {
          return {
            ok: false,
            message: err.message,
          };
        }
    },
    refresh: (payload) => { // refresh token 발급
        //refresh token 만료일 200일
        return jwt.sign(payload, process.env.RSA_REFRESH_KEY, {
          algorithm: 'HS256',
          expiresIn: '200d',
        });
    },
    refreshVerify: async (token) => { // refresh token 검증
        let decoded = null;
        try {
          decoded = jwt.verify(token, process.env.RSA_REFRESH_KEY);
          return {
            ok: true,
            username: decoded.username,
            role: decoded.role,
          };
        } catch (err) {
          return {
            ok: false,
            message: err,
          };
        }
    },
}