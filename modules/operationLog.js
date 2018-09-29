const query = require('../utils/sqlTools');
const SqlString = require('sqlstring');

const getOperationLog = async (where) => {
  try {
      // select `content`,`type`,`time` from operationLog_t where studentId=21509081011
      let sql = 'select `content`,`type`,`time` from operationLog_t';
      // add where
      if (Object.keys(where) != 0) {
          sql += " where ?";
          sql = SqlString.format(sql, where);
      }
      sql += "order by cast(time as datetime)"
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
  getOperationLog
}