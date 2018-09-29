const query = require('../utils/sqlTools');
const tableName = require('../config/colName').paperTable;
const SqlString = require('sqlstring');
const trim = require('../utils/removeSpace');

/**
 * 
 * @param {object} where 
 * @param {Int} p 
 * @param {Int} n 
 */
const getPapers = async (where, p, n) => {
    try {
        const limitS = n*(p-1);
        const limitE = n*p;
        // select * from `papers_t` where `condition` = 'available'
        // notice ! LIMIT 5,10; //检索记录行6-15
        let sql = 'select `id`,`title`,`teacher`,`condition`, `checked` from `papers_t`';
        // add where
        if (Object.keys(where) != 0) {
            sql += " where ?";
            sql = SqlString.format(sql, where);
        }
        // here is a bug. todo: fix show all papers when p=0;
        if (limitE != 0)
            sql += ` LIMIT ${limitS},${limitE}`;
        const res = await query(sql);
        if (res.length == 0 || res == [])
            throw("无可用的论文选题");
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
 * @param {object} values 
 * @param {object} where 
 */
const updatePaper = async (values, where) => {
    // 根据 params 来更新 paper 记录.
    // UPDATE `paperRegister`.`papers_t` SET `condition`='waiting' WHERE `id`='10';
    try {
        const v = values || {};
        const w = where || {};
        let sql = SqlString.format("UPDATE `papers_t` SET ? WHERE ?", [v, w]);
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

/**
 * 
 */
const getPaperCounts = async (where) => {
    try {
        // select * from `papers_t` where `condition` = 'available'
        // notice ! LIMIT 5,10; //检索记录行6-15
        let sql = 'select count(`id`) from `papers_t`';
        // add where
        if (Object.keys(where).length != 0) {
            sql += " where ?";
            sql = SqlString.format(sql, where);
        }
        const res = await query(sql);
        if (res.length == 0)
            throw("无可用的论文选题");
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

const getPaperStatus = async (id) => {
    try {
        let sql = SqlString.format('select `condition` from `papers_t` where `id` = ?', id);
        const res = await query(sql);
        if (res.length === 0) {
            return {
                status: false,
                body: "找不到相应的论文"
            }
        } else {
            return {
                status: true,
                body: res[0].condition
            }
        }
    } catch (err) {
        return {
            status: false,
            body: err.message
        }
    }
}

/**
 * 
 * @param {Object} papers 
 */
const importPapers = async (papers) => {
    try {
        // 组装 sql 语句并执行。
        // 注意表列和数据库字段名之间的关系
        // INSERT INTO `papers_t` (`title`, `teacher`) VALUES ('《逻辑线性回归原理》', '张坤');
        const data = (papers[0].data);
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
            sql += SqlString.format("INSERT INTO `papers_t` (" + cols + ") VALUES (" + values + ");", data[j]);
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
    // DROP TABLE `papers_t`;
    try {
        const sql = "DROP TABLE `papers_t`";
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
        const sql = "TRUNCATE `papers_t`";
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

/*
CREATE TABLE `paperRegister`.`papers_t` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NULL,
  `teacher` VARCHAR(45) NULL,
  `condition` VARCHAR(45) NULL DEFAULT 'available',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `title_UNIQUE` (`title` ASC),
  UNIQUE INDEX `teacher_UNIQUE` (`teacher` ASC));
*/

module.exports = {
    getPaperStatus: getPaperStatus,
    getPapers: getPapers,
    importPapers: importPapers,
    updatePaper: updatePaper,
    drop: drop,
    truncate: truncate,
    getPaperCounts: getPaperCounts
}