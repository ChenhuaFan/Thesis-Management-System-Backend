const query = require('../utils/sqlTools');
const SqlString = require('sqlstring');

const getEnrollRecord = async (where) => {
  try {
      // SELECT `paperId` FROM enroll_t where `studentId` = 21509081010
      let sql = 'SELECT `paperId`, `studentId` FROM enroll_t';
      // add where
      if (Object.keys(where) != 0) {
          sql += " where ?";
          sql = SqlString.format(sql, where);
      }
      // here is a bug. todo: fix show all papers when p=0;
      const res = await query(sql);
      if (res.length == 0 || res == [])
          throw("无记录");
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

module.exports = {
  getEnrollRecord
}