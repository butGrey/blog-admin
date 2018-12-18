const Koa = require('koa');
const views = require('koa-views');
const bodyParser = require('koa-bodyparser');
const staticCache = require('koa-static-cache');
const staticServe = require('koa-static');
const path = require('path');
const session = require('koa-session-minimal');
const MysqlStore = require('koa-mysql-session');
const config = require('./config/default.js');
const cors = require('koa-cors');
var app = new Koa();

//处理跨域问题
app.use(cors());
// session存储配置
const sessionMysqlConfig= {
    user: config.database.USERNAME,
    password: config.database.PASSWORD,
    database: config.database.DATABASE,
    host: config.database.HOST
};
// 配置session中间件
app.use(session({
    key: 'USER_SID',
    store: new MysqlStore(sessionMysqlConfig)
}));

app.use(staticCache(path.join(__dirname, './public'), { dynamic: true }, {
    maxAge: 365 * 24 * 60 * 60
}));
app.use(staticCache(path.join(__dirname, './images'), { dynamic: true }, {
    maxAge: 365 * 24 * 60 * 60
}));
app.use(staticServe(__dirname + '/public'));


app.use(views('views',{extension:'ejs'}));
app.use(bodyParser({formLimit: '1mb'}));

app.use(require('./routers/router.js'));

app.listen(config.port);
