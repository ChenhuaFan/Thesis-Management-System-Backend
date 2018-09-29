const jwt = require('jsonwebtoken');
const config = require('../config/token');

/**
 * 
 * @param {Object} payload 
 */
const sign = (payload) => {
    return jwt.sign(
        payload, 
        config.secret, 
        {
            expiresIn:  1200 //秒到期时间
        }
    );
}

const verify = (token) => {
    try {
        const res = jwt.verify(token, config.secret);
        return {
            status: true,
            body: res
        }
    } catch (err) {
        return {
            status: false,
            body: err.message
        }
    }
}

module.exports = {
    sign: sign,
    verify: verify
}