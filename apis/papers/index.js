const router = require('koa-router')()
const papers = require('../../modules/paper');
const students = require('../../modules/student');
const excel = require('node-xlsx');
const upload = require('../../config/upload');
const fs = require('fs');
const status = require('../../config/paperStatus');

// import middlewares
const {userOnly, studentOnly, teacherOnly, adminOnly, rootOnly} = require('../../middlewares/userCheck');

router.prefix('/paper');

router.get(
	'/get',
	userOnly,
  	async (ctx, next) => {
		// return paper object list.
		try {
			const condition = ctx.request.query.condition || "";
			const id = ctx.request.query.id || "";
			const teaId = ctx.request.query.teaName || "";
			const p = parseInt(ctx.request.query.p || 0);
			const n = parseInt(ctx.request.query.n || 0);
			let where = {}
			// paper data.
			if (condition)
				where['condition'] = condition;
			if (id)
				where['id'] = id;
			if (teaId)
				where['teacher'] = teaId;
			let res = await papers.getPapers(where, p, n);
			let counts = await papers.getPaperCounts(where);
			if (res.status && counts.status) {
				const papers = res.body;
				let newBody = [];
				// get students info.
				for(let i in papers) {
					newBody[i] = papers[i];
					let stu = await students.getStudentById(newBody[i].student);
					if (stu.status) {
						for(let j in stu.body) {
							newBody[i][j=='id'?'stuId':j] = stu.body[j];
						}
					}
				}
				ctx.body = {
					status: true,
					counts: counts.body,
					body: newBody
				};
			}
			else
				ctx.throw(400, res.body || counts.body);
		} catch (err) {
			ctx.body = {
				status: false,
				body: err.message
			};
		}
  	}
);

router.post(
	'/enroll',
	studentOnly,
	async (ctx, next) => {
		// update a certain paper's condition to 'waiting'
		try {
			const jwtId = ctx.jwtBody.id;
			const id = ctx.request.body.id || "";
			const tar = ctx.request.body.tar || "";
			if (jwtId != id || !id || !tar)
				ctx.throw(403, "因参数问题被拒绝");
			// check paper condition
			let paper = await papers.getPaperStatus(tar);
			if (paper.status == false || paper.body != status.available) {
				ctx.throw(400, "论文状态不正确");
				return;
			}
			let values = {}, where = {id: tar};
			values['condition'] = "waiting";
			values['student'] = id;
			// update waiting and set tar as student in paper table.
			const res = await papers.updatePaper(values, where);
			if (res.status) {
				// create token
				ctx.body = {
					status: true,
					body: res.body
				};
			}
			else
				ctx.throw(400, res.body);
		} catch (err) {
			ctx.body = {
				status: false,
				body: err.message
			};
		}
	}
)

// router.post(
// 	'/confirm',
// 	studentOnly,
// 	async (ctx, next) => {
// 		// update a certain paper's condition to 'waiting'
// 		try {
// 			const jwtId = ctx.jwtBody.id;
// 			const id = ctx.request.body.id || "";
// 			const tar = ctx.request.body.tar || "";
// 			if (jwtId != id || !id || !tar)
// 				ctx.throw(403, "因参数问题被拒绝");
// 			// check paper condition
// 			let paper = await papers.getPaperStatus(id);
// 			if (paper.status == false || paper.body != status.rejected) {
// 				ctx.throw(400, "论文状态不正确");
// 				return;
// 			}
// 			let values = {}, where = {id: id};
// 			values['condition'] = status.available;
// 			values['student'] = "";
// 			// update waiting and set tar as student in paper table.
// 			const res = await papers.updatePaper(values, where);
// 			if (res.status) {
// 				// create token
// 				ctx.body = {
// 					status: true,
// 					body: res.body
// 				};
// 			}
// 			else
// 				ctx.throw(400, res.body);
// 		} catch (err) {
// 			ctx.body = {
// 				status: false,
// 				body: err.message
// 			};
// 		}
// 	}
// )

router.post(
	'/accept',
	teacherOnly,
	async (ctx, next) => {
		// update a certain paper's condition to 'checked'
		try {
			const jwtId = ctx.jwtBody.id;
			const id = ctx.request.body.id || "";
			const tar = ctx.request.body.tar || "";
			if (jwtId != id || !id || !tar)
				ctx.throw(403, "因参数问题被拒绝");
			// check paper condition
			let paper = await papers.getPaperStatus(tar);
			if (paper.status == false || paper.body != status.waiting) {
				ctx.throw(400, "论文状态不正确");
				return;
			}
			let values = {}, where = {id: tar};
			values['condition'] = "checked";
			const res = await papers.updatePaper(values, where);
			if (res.status) {
				// create token
				ctx.body = {
					status: true,
					body: res.body
				};
			}
			else
				ctx.throw(400, res.body);
		} catch (err) {
			ctx.body = {
				status: false,
				body: err.message
			};
		}
	}
)

router.post(
	'/reject',
	teacherOnly,
	async (ctx, next) => {
		// update a certain paper's condition to 'checked'
		try {
			const jwtId = ctx.jwtBody.id;
			const id = ctx.request.body.id || "";
			const tar = ctx.request.body.tar || "";
			if (jwtId != id || !id || !tar)
				ctx.throw(403, "因参数问题被拒绝");
			// check paper condition
			let paper = await papers.getPaperStatus(tar);
			if (paper.status == false || paper.body != status.waiting) {
				ctx.throw(400, "论文状态不正确");
				return;
			}
			let values = {}, where = {id: tar};
			values['condition'] = "available";
			values['student'] = null;
			const res = await papers.updatePaper(values, where);
			if (res.status) {
				// create token
				ctx.body = {
					status: true,
					body: res.body
				};
			}
			else
				ctx.throw(400, res.body);
		} catch (err) {
			ctx.body = {
				status: false,
				body: err.message
			};
		}
	}
)

router.post(
	'/cancel',
	studentOnly,
	async (ctx, next) => {
		// update a certain paper's condition to 'checked'
		try {
			const jwtId = ctx.jwtBody.id;
			const id = ctx.request.body.id || "";
			const tar = ctx.request.body.tar || "";
			if (jwtId != id || !id || !tar)
				ctx.throw(403, "因参数问题被拒绝");
			// check paper condition
			let paper = await papers.getPaperStatus(tar);
			if (paper.status == false || paper.body != status.waiting) {
				ctx.throw(400, "论文状态不正确");
				return;
			}
			let values = {}, where = {id: tar};
			values['condition'] = "available";
			values['student'] = null;
			const res = await papers.updatePaper(values, where);
			if (res.status) {
				// create token
				ctx.body = {
					status: true,
					body: res.body
				};
			}
			else
				ctx.throw(400, res.body);
		} catch (err) {
			ctx.body = {
				status: false,
				body: err.message
			};
		}
	}
)

router.post(
	'/backout',
	teacherOnly,
	async (ctx, next) => {
		// update a certain paper's condition to 'checked'
		try {
			const jwtId = ctx.jwtBody.id;
			const id = ctx.request.body.id || "";
			const tar = ctx.request.body.tar || "";
			if (jwtId != id || !id || !tar)
				ctx.throw(403, "因参数问题被拒绝");
			// check paper condition
			let paper = await papers.getPaperStatus(tar);
			if (paper.status == false || paper.body != status.checked) {
				ctx.throw(400, "论文状态不正确");
				return;
			}
			let values = {}, where = {id: tar};
			values['condition'] = "available";
			values['student'] = null;
			const res = await papers.updatePaper(values, where);
			if (res.status) {
				// create token
				ctx.body = {
					status: true,
					body: res.body
				};
			}
			else
				ctx.throw(400, res.body);
		} catch (err) {
			ctx.body = {
				status: false,
				body: err.message
			};
		}
	}
)

router.post(
	'/import',
	upload.single('excel'),
	adminOnly,
	async (ctx, next) => {
		try {
			if (!ctx.req.file)
				ctx.throw(400, "缺少请求参数");
			let filePath = ctx.req.file.path;
			// get excel json
			let content = excel.parse(filePath);
			// delete excel file
			fs.unlink(filePath, function (err) {
				if (err) throw(err);
			})
			// deliver excel json to teacher papers.
			let res = await papers.importPapers(content);
			if (res.status) {
				ctx.body = {
					status: true,
					body: "插入成功"
				};
			} else {
				ctx.throw(400, res.body);
			}
		} catch (err) {
			ctx.body = {
				status: false,
				body: err.message
			};
		}
	}
);

// drop paper table
// router.get(
//   	'/drop', 
//   	rootOnly,
// 	async (ctx, next) => {
// 		try {
// 			const res = await papers.drop();
// 			if (res.status) {
// 				ctx.body = {
// 					status: true,
// 					body: "删除成功"
// 				};
// 			} else {
// 				ctx.throw(400, res.body);
// 			}
// 		} catch (err) {
// 			ctx.body = {
// 				status: false,
// 				body: err.message
// 			};
// 		}
// 	}
// )

// truncate paper table
router.get(
	'/truncate',
	rootOnly,
  	async (ctx, next) => {
		try {
			const res = await papers.truncate();
			if (res.status) {
				ctx.body = {
					status: true,
					body: "清空成功"
				};
			} else {
				ctx.throw(400, res.body);
			}
		} catch (err) {
			ctx.body = {
				status: false,
				body: err.message
			};
		}
  	}
)

module.exports = router