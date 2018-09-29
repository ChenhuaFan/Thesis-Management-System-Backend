const jwt = require('../modules/token');

function removeTime (obj) {
	delete obj["iat"];
	delete obj["exp"];
	return obj;
}

const userOnly = async (ctx, next) => {
	try {
		// check user from token
		const token = ctx.request.header.jwt;
		const res = jwt.verify(token);
		if (res.status) {
			ctx.jwtBody = removeTime(res.body);
			await next();
		}
		else
			ctx.throw(403, "令牌不合法");
	} catch (err) {
		ctx.body = {
			status: false,
			body: err.message
		};
	}
}

const studentOnly = async (ctx, next) => {
	try {
		// check user from token
		const token = ctx.request.header.jwt;
		const res = jwt.verify(token);
		if (res.status && res.body.role == "student") {
			ctx.jwtBody = removeTime(res.body);
			await next();
		}
		else
			ctx.throw(403, "令牌不合法");
	} catch(err) {
		ctx.body = {
			status: false,
			body: err.message
		};
	}
}

const teacherOnly = async (ctx, next) => {
	try {
		// check user from token
		const token = ctx.request.header.jwt;
		const res = jwt.verify(token);
		if (res.status && res.body.role == "teacher") {
			ctx.jwtBody = removeTime(res.body);
			await next();
		}
		else
			ctx.throw(403, "令牌不合法");
	} catch(err) {
		ctx.body = {
			status: false,
			body: err.message
		};
	}
}

const adminOnly = async (ctx, next) => {
	try {
		// check user from token
		const token = ctx.request.header.jwt;
		const res = jwt.verify(token);
		if (res.status && (res.body.role == "admin" || res.body.role == "root")) {
			ctx.jwtBody = removeTime(res.body);
			await next();
		}
		else
			ctx.throw(403, "令牌不合法");
	} catch(err) {
		ctx.body = {
			status: false,
			body: err.message
		};
	}
}

const rootOnly = async (ctx, next) => {
	try {
		// check user from token
		const token = ctx.request.header.jwt;
		const res = jwt.verify(token);
		if (res.status && res.body.role == "root") {
			ctx.jwtBody = removeTime(res.body);
			await next();
		}
		else
			ctx.throw(403, "令牌不合法");
	} catch(err) {
		ctx.body = {
			status: false,
			body: err.message
		};
	}
}

module.exports = {
	userOnly: userOnly,
	studentOnly: studentOnly,
	teacherOnly: teacherOnly,
	adminOnly: adminOnly,
	rootOnly: rootOnly
};