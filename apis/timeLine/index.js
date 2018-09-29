const router = require('koa-router')()
const operationLog = require('../../modules/operationLog');

// import middlewares
const {userOnly, studentOnly, teacherOnly, adminOnly, rootOnly} = require('../../middlewares/userCheck');

router.prefix('/timeline');

router.get(
	'/get',
	// studentOnly,
  	async (ctx, next) => {
		// return paper object list.
		try {
			const stuId = ctx.request.query.stuId || "";
			let where = {}
			// paper data.
			if (stuId)
				where['studentId'] = stuId;
			let res = await operationLog.getOperationLog(where);
			if (!res.status)
				ctx.throw(400, res.body);
			else
				ctx.body = {
					status: true,
					body: res.body
				};
		} catch (err) {
			ctx.body = {
				status: false,
				body: err.message
			};
		}
  }
);

module.exports = router