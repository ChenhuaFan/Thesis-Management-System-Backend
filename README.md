# 论文后台

#### 项目介绍
就是论文后台了

#### 软件架构
软件架构很简单：通过 nginx 转发请求。将前端页面请求转发到8000端口（另一个 vue 项目）；再将 api 请求转发到3000后台服务（本系统）端口。从而可以有效解决跨域问题。


#### 安装教程

1. clone 到本地
2. 在本地项目文件夹内 > npm install
3. npm run dev //运行系统

#### 使用说明

1. 首先需要安装 nginx；参考：https://www.cnblogs.com/jiangwangxiang/p/8481661.html
2. 再将 /files/nginx.conf 文件替换本地的 nginx 配置文件。参考上述链接。
3. 将 files 文件夹中 的 db.sql导入到本地数据库中；并修改 /config/db.js 中的配置，以确保您可以连接到本地数据库。
3. 启动本系统后，您就可以正常使用另一个前端系统了。

#### 参与贡献

1. Fork 本项目
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request