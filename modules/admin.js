const query = require('../utils/sqlTools');
const SqlString = require('sqlstring');
const trim = require('../utils/removeSpace');

/**
 * 
 * @param {string} id 
 * @param {string} pw 
 * @returns {boolean, string} status, msg
 */
const doLogin = async (id, pw) => {
    try {
        if (id == undefined || pw == undefined)
            throw("wrong params");
        let sql = SqlString.format('select `id`,`name`,`securitylevel` from admins_t where name = ? and pw = ?', [trim(id), pw]);
        let res = await query(sql);
        if (res.length === 0) {
            return {
                status: false,
                body: "错误的用户名或密码"
            }
        } else {
            return {
                status: true,
                body: res[0]
            }
        }
    } catch (err) {
        return {
            status: false,
            body: "内部错误"
        }
    }
}

/**
 * 
 * @param {object} values 
 * @param {object} where 
 */
const updateAdmin = async (values, where) => {
    // 根据 params 来更新 paper 记录.
    // UPDATE `paperRegister`.`students_t` SET `condition`='waiting' WHERE `id`='10';
    try {
        const v = values || {};
        const w = where || {};
        let sql = SqlString.format("UPDATE `admins_t` SET ? WHERE ?", [v, w]);
        // let sql = SqlString.format("UPDATE `papers_t` SET `condition`= ? WHERE `id`= ?;", [trim(condition), trim(id)]);
        const res = await query(sql);
        if (res.affectedRows == 0)
            throw("更新失败，没有对应的 id");
        return {
            status: true,
            body: "更新成功"
        }
    } catch (err) {
        return {
            status: false,
            body: err.message//""
        }
    }
}

module.exports = {
    updateAdmin: updateAdmin,
    doLogin: doLogin
}