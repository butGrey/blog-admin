const router = require('koa-router')();
//const common = require('../module/common.js');
const config = require('../config/default.js');
const sql = require('../lib/mysql.js');
const moment = require('moment');

//登录页面路由
router.get('/login',async(ctx,next)=>{
    var compare = function () {
        return {
            name:'bll',
            password:'123'
        }
    };
    let content='hello,sunshine!';
    await ctx.render('index',{
        content:content
    });
});
//获取表单提交数据（测试）
router.post('/login',async (ctx,next)=>{
    let { name,password } = ctx.request.body;
    if (name=="bll"&&password=="bll123"){
        ctx.body = {
            code: 200,
            message: '登陆成功'
        }
    }else{
        ctx.body = {
            code: 500,
            message: '用户名或密码错误!'
        };
        console.log('用户名或密码错误!');
    }
});
//文章列表接口（http://localhost:3000/messages）
router.get('/messages',async(ctx,next)=>{
    await sql.findAllPosts()
        .then(res => {
        ctx.body = {
            code: 200,
            data: res,
            message:'获取列表成功'
        };
    }).catch(err=>{
        ctx.body = {
            code: 500,
            message: '获取列表失败'
        }
    })
});
//主页面展示所有文章
router.get('/',async(ctx,next)=>{
    let articles;
    await sql.findAllPosts()
        .then(res => {
            articles = res
        });
    await ctx.render('test',{
        articles:articles
    })
});
//主页面删改文章
router.post('/',async(ctx,next)=>{
    console.log(ctx.request.body+"---post---");
    let {id} = ctx.request.body;
    await sql.deletePosts(id)
        .then(()=>{
            ctx.body = {
                code: 200,
                message: '删除文章成功'
            }
        }).catch(()=> {
            ctx.body = {
                code: 500,
                message: '发表文章失败'
            }
        })
});
//添加文章页面-路由
router.get('/article',async(ctx,next)=>{
    await ctx.render('article');
});
//添加文章，获取表单提交的文章数据，并添加到数据库
router.post('/article',async (ctx,next)=> {
    console.log(ctx.request.body);
    let {title, category, content} = ctx.request.body;
    let time = moment().format('YYYY-MM-DD HH:mm:ss');
    await  sql.insertPosts([title, category, content, time])
        .then(()=> {
            ctx.body = {
                code: 200,
                message: '上传文章成功'
            }
        }).catch(()=> {
            ctx.body = {
                code: 500,
                message: '上传文章失败'
            }
        })
});
module.exports =router.routes();
