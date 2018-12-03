const router = require('koa-router')();
//const common = require('../module/common.js');
const config = require('../config/default.js');
const sql = require('../lib/mysql.js');
const moment = require('moment');


//主页面展示所有文章
router.get('/',async(ctx,next)=>{
    let articles;
    await sql.findAllPosts()
        .then(res => {
            articles = res
        });
    await ctx.render('articles',{
        articles:articles
    })
});
//主页面删改文章
router.post('/',async(ctx,next)=>{
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
//修改文章-路由
router.get('/editarticle/:aid',async(ctx,next)=>{
    let aid = ctx.params.aid,
        res;
    await sql.findDataById(aid)
        .then(result => {
            res = result[0];
            console.log(res);
        });
    await ctx.render('editarticle', {
        title: res.title,
        content: res.content,
        category: res.category
    })
});
//修改文章-数据
router.post('/editarticle/:aid',async(ctx,next)=>{
    let title = ctx.request.body.title,
        category = ctx.request.body.category,
        content = ctx.request.body.content,
        aid = ctx.params.aid;
    await  sql.updatePost([title, content, category, aid])
        .then(()=> {
            ctx.body = {
                code: 200,
                message: '修改文章成功'
            }
        }).catch(()=> {
            ctx.body = {
                code: 500,
                message: '修改文章失败'
            }
        })
    });
//添加文章-路由
router.get('/addarticle',async(ctx,next)=>{
    await ctx.render('article');
});
//添加文章-数据
router.post('/addarticle',async (ctx,next)=> {
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
module.exports =router.routes();
