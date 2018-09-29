const router = require('koa-router')()
const modules = require('../../modules/admin');
const jwt = require('../../modules/token');

const crypto = require('crypto');

// import middlewares
const {userOnly, studentOnly, teacherOnly, adminOnly, rootOnly} = require('../../middlewares/userCheck');

router.prefix('/admin');

// 登入
router.post(
    '/login', 
    async function(ctx, next) {
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
					role: "admin",
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
	adminOnly,
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
			const res = await modules.updateAdmin(values, where);
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
	adminOnly,
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

// 登出
// router.get(
//     '/logout', 
//     async (ctx, next) => {
//         ctx.session.user = null;
//         ctx.body = {
//             status: true
//         }
//     }
// );

// 临时提升安全等级
router.post(
	'/root',
	adminOnly,
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
					role: "root",
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



module.exports = router