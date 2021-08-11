# Thesis-Management-System

A front-end back-end separate system contains a web app and a NodeJS backend

#### Project Description

Thesis management system helps the College of Information Engineering at Huangshan University to manage graduate theses of senior students.

## Front-end

This is a Vue web application with iView UI, Vue Router, and VueX.

#### Instructions

1. nginx needs to be installed
2. need to run the backend system in another project at the same time
3. available usernames are Student:21509081011~21509081013 Teacher:1,2; password is 123456

#### Installation & Usage
> By default, you have understood and completed the instructions
```shell
git clone https://github.com/ChenhuaFan/Thesis-Management-System-Frontend.git
cd paper
npm install
npm run-script serve
```
Open your browser localhost:81 and you can use the login page.

## Back-end

#### software architecture

Requests are forwarded via nginx. The front-end page requests are forwarded to port 8080 (another vue project); then the api requests are forwarded to port 3000 of the backend service (this system). This effectively solves the cross-domain problem.

#### instructions

1. First, you need to install nginx; refer to https://www.cnblogs.com/jiangwangxiang/p/8481661.html
2. Replace the /files/nginx.conf file with the local nginx configuration file. Refer to the link above. 3.
3. Import the db.sql from the files folder into the local database; modify the configuration in /config/db.js to ensure that you can connect to the local database.

#### installation tutorial

```shell
git clone https://github.com/ChenhuaFan/Thesis-Management-System-Backend.git
cd background_of_paper
npm install
npm run dev
```

#### Contribute

1. Fork this project
2. Create a new Feat_xxx branch
3. Submit the code
4. Create a new Pull Request
