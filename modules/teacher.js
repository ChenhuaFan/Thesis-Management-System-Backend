const query = require('../utils/sqlTools');
const tableName = require('../config/colName').teacherTable;
const SqlString = require('sqlstring');
const trim = require('../utils/removeSpace');

const getTeachers = async (p, n) => {
    try {
        const limitS = n*(p-1);
        const limitE = n*p;
        // notice ! LIMIT 5,10; //检索记录行6-15
        let sql = 'select `id`,`name` from `teachers_t`';
        // here is a bug. todo: fix show all papers when p=0;
        if (limitE != 0)
            sql += ` LIMIT ${limitS},${limitE}`;
        const res = await query(sql);
        if (res.length == 0)
            throw("未能查找到教师");
        return {
            status: true,
            body: res
        }
    } catch(err) {
        return {
            status: false,
            body: err.message
        }
    }
}

/**
 * 
 * @param {string} id 
 * @returns {Array} studentList
 */
const getTeacherById = async (id) => {
    try {
        let sql = SqlString.format('select `id`,`name` from teachers_t where id = ?', [trim(id)]);
        let res = await query(sql);
        if (res.length == 0)
            throw("查找的用户不存在");
        return {
            status: true,
            body: res[0]
        };
    } catch (err) {
        return {
            status: false,
            body: err.message
        };
    }
}


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
        let sql = SqlString.format('select `id`,`name` from teachers_t where id = ? and pw = ?', [trim(id), pw]);
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
const updateTeacher = async (values, where) => {
    // 根据 params 来更新 paper 记录.
    // UPDATE `paperRegister`.`students_t` SET `condition`='waiting' WHERE `id`='10';
    try {
        const v = values || {};
        const w = where || {};
        let sql = SqlString.format("UPDATE `teachers_t` SET ? WHERE ?", [v, w]);
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

const getTeacherCounts = async (where) => {
    try {
        // select * from `papers_t` where `condition` = 'available'
        // notice ! LIMIT 5,10; //检索记录行6-15
        let sql = 'select count(`id`) from `teachers_t`';
        // add where
        // if (Object.keys(where).length != 0) {
        //     sql += " where ?";
        //     sql = SqlString.format(sql, where);
        // }
        const res = await query(sql);
        if (res.length == 0)
            throw("无学生");
        return {
            status: true,
            body: res[0]['count(`id`)']
        }
    } catch(err) {
        return {
            status: false,
            body: err.message
        }
    }
}

/**
 * 
 * @param {Object} teachers 
 */
const importTeachers = async (teachers) => {
    try {
        // 组装 sql 语句并执行。
        // 注意表列和数据库字段名之间的关系
        // INSERT INTO `paperRegister`.`teachers_t` (`id`, `name`) VALUES ('123456', '张坤');
        const data = (teachers[0].data);
        let colName = data[0];
        let sql = "";
        for (let j=1, rows=data.length; j<rows; j++) {
            if (data[j][0] == undefined)
                break;
            let cols = "";
            let values = "";
            for (let i=0, len=colName.length; i<len; i++) {
                if (i != len - 1) {
                    cols += "`"+tableName[trim(colName[i])]+"`, ";
                    values += "?, ";
                } else  {
                    cols += "`"+tableName[trim(colName[i])]+"`";
                    values += "?";
                }
            }
            sql += SqlString.format("INSERT INTO `teachers_t` (" + cols + ") VALUES (" + values + ");", data[j]);
        }
        return {
            status: true,
            body: await query(sql)
        }
    } catch(err) {
        return {
            status: false,
            body: err.message //"表格列名不匹配或插入记录与已存在记录冲突"
        }
    }
} 

const drop = async () => {
    // DROP TABLE `teachers_t`;
    try {
        const sql = "DROP TABLE `teachers_t`";
        const res = await query(sql);
        return {
            status: true,
            body: "ok"
        }
    } catch(err) {
        return {
            status: false,
            body: err.message
        }
    }
}

const truncate = async () => {
    try {
        const sql = "TRUNCATE `teachers_t`";
        const res = await query(sql);
        return {
            status: true,
            body: "ok"
        }
    } catch(err) {
        return {
            status: false,
            body: err.message
        }
    }
}

module.exports = {
    getTeachers: getTeachers,
    getTeacherById: getTeacherById,
    doLogin: doLogin,
    updateTeacher: updateTeacher,
    importTeachers: importTeachers,
    drop: drop,
    truncate: truncate,
    getTeacherCounts: getTeacherCounts
}