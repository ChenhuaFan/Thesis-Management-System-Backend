const router = require('koa-router')()
const enroll = require('../../modules/enroll');
const students = require('../../modules/student');

// import middlewares
const {userOnly, studentOnly, teacherOnly, adminOnly, rootOnly} = require('../../middlewares/userCheck');

router.prefix('/enroll');

router.get(
	'/get',
	// studentOnly,
  	async (ctx, next) => {
		// return paper object list.
		try {
			const stuId = ctx.request.query.stuId || "";
			const paperId = ctx.request.query.paperId || "";
			let where = {}
			// paper data.
			if (stuId)
				where['studentId'] = stuId;
			if (paperId)
				where['paperId'] = paperId;
			let res = await enroll.getEnrollRecord(where);
			if (!res.status)
				ctx.throw(400, res.body);
			if (paperId) {
				// 若存在 paperId，则需要去填充学生信息
				const papers = res.body;
				let newBody = [];
				// get students info.
				for(let i in papers) {
					let stu = await students.getStudentById(papers[i].studentId);
					if (stu.status) {
						newBody[i] = stu.body;
					}
				}
				ctx.body = {
					status: true,
					body: newBody
				};
			} else {
				ctx.body = {
					status: true,
					body: res.body
				};
			}
		} catch (err) {
			ctx.body = {
				status: false,
				body: err.message
			};
		}
  	}
);

module.exports = router