const router = require('koa-router')();
const excel = require('node-xlsx');
const upload = require('../../config/upload');
const fs = require('fs');
const modules = require('../../modules/teacher');
const jwt = require('../../modules/token');

const crypto = require('crypto');

// import middlewares
const {userOnly, studentOnly, teacherOnly, adminOnly, rootOnly} = require('../../middlewares/userCheck');

router.prefix('/teacher');

router.get(
	'/get',
	userOnly,
    async (ctx, next) => {
        try {
			const id = ctx.request.query.name || "";
			const p = parseInt(ctx.request.query.p || 0);
			const n = parseInt(ctx.request.query.n || 0);
			let res = [];
			let counts = 0;
			if (id != "") {
				// 查找具体的 teacher
				res = await modules.getTeacherById(id);
			} else {
				// 返回 teachers 列表
				res = await modules.getTeachers(p, n);
				counts = await modules.getTeacherCounts();
			}
			if (res.status) {
				ctx.body = {
					status: true,
					counts: counts.status ? counts.body : 0,
					body: res.body
				}
			} else 
				ctx.throw(400, "查找的用户不存在")
		} catch (err) {
			ctx.body = {
				status: false,
				body: err.message
			}
		}
    }
);

router.post(
    '/login',
    async (ctx, next) => {
        try {
			const hash = crypto.createHash('sha256');
			const id = ctx.request.body.id || "";
			hash.update(ctx.request.body.pw || "");
			const pw = hash.digest('hex');
			const res = await modules.doLogin(id, pw);
			if (res.status) {
				// 生成 token
				const payload = {
					id: res.body.id,
					name: res.body.name,
					role: "teacher",
				};
				const token = await jwt.sign(payload);
				ctx.body = {
					status: true,
					token: token
				}
			}
			else
				ctx.throw(400, res.body);
		} catch(err) {
			ctx.body = {
				status: false,
				body: err.message
			};
		}
    }
);

router.post(
	'/changepw',
	teacherOnly,
	async (ctx, next) => {
		try {	
			// check target
			const jwtId = ctx.jwtBody.id;
			const id = ctx.request.body.id || "";
			const pw = ctx.request.body.pw || "";
			if (jwtId != id || !id || !pw)
				ctx.throw(403, "因参数问题被拒绝");
			const hash = crypto.createHash('sha256');
			hash.update(pw);
			let values = {pw: hash.digest('hex')}, where = {id: id};
			const res = await modules.updateTeacher(values, where);
			if (res.status) {
				ctx.body = {
					status: true,
					body: res.body
				}
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
	'/update',
	teacherOnly,
	async (ctx, next) => {
		try {
			const payload = ctx.jwtBody;
			const token = await jwt.sign(payload);
			ctx.body = {
				status: true,
				token: token
			}
		} catch (err) {
			ctx.body = {
				status: false,
				body: err.message
			}
		}
	}
);

// router.get(
//     '/logout',
//     async (ctx, next) => {
//         ctx.session.user = null;
//         ctx.body = {
//             status: true
//         }
//     }
// );

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
			// deliver excel json to teacher modules.
			let res = await modules.importTeachers(content);
			if (res.status) {
				ctx.body = {
					status: true,
					body: "插入成功"
				};
			} else
				ctx.throw(400, res.body);
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
// 			const res = await modules.drop();
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
			const res = await modules.truncate();
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