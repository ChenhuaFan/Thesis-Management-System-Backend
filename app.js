const Koa = require('koa')
const app = new Koa()
// const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

// import controller
// const main = require('./controller/index');
// const student = require('./controller/student');
// const teacher = require('./controller/teacher');
// const admin = require('./controller/admin');

// import api
const studentApi = require('./apis/students');
const teacherApi = require('./apis/teachers');
const adminApi = require('./apis/admins');
const paperApi = require('./apis/papers');
const enrollApi = require('./apis/enroll');
const timeLineApi = require('./apis/timeLine');

// set key for cookies
// app.keys = ['$#pVR7o^QTA6EvvQ', 'TQKj$V$hz4!5d9k9'];

// error handler
onerror(app)

// middlewares
app.use(bodyparser())
app.use(logger())

// set app.context
app.context.jwtBody = {};

// test here to show excel
// var obj = excel.parse("./text_files/" + "students.xlsx");
// console.log(JSON.stringify(obj));

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
  // ctx.response.set("Access-Control-Allow-Origin", "localhost:8080");
})

// app.use(async (ctx, next) => {
//   await next();
//   console.log("我执行啦！");
//   // ctx.response.header["Access-Control-Allow-Headers"] = "Content-Type,Content-Length, Authorization, Accept,X-Requested-With";
//   // ctx.response.header["Access-Control-Allow-Methods"] = "localhost:8080";
//   console.log(ctx.response.header);
// })

// controller
// app.use(main.routes(), main.allowedMethods());
// app.use(teacher.routes(), teacher.allowedMethods());
// app.use(student.routes(), student.allowedMethods());
// app.use(admin.routes(), admin.allowedMethods());

// api routes
app.use(studentApi.routes(), studentApi.allowedMethods());
app.use(teacherApi.routes(), teacherApi.allowedMethods());
app.use(adminApi.routes(), adminApi.allowedMethods());
app.use(paperApi.routes(), paperApi.allowedMethods());
app.use(enrollApi.routes(), enrollApi.allowedMethods());
app.use(timeLineApi.routes(), timeLineApi.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
