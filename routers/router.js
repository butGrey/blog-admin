const router = require('koa-router')();
//const common = require('../module/common.js');
const config = require('../config/default.js');
const sql = require('../lib/mysql.js');
const moment = require('moment');
const fs = require('fs');
const md = require('markdown-it')();
const path = require('path');

//主页面展示所有文章
router.get('/',async(ctx)=>{
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
router.post('/',async(ctx)=>{
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
                message: '删除文章失败'
            }
        })
});
//修改文章-路由
router.get('/editarticle/:aid',async(ctx)=>{
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
router.post('/editarticle/:aid',async(ctx)=>{
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
router.get('/addart',async(ctx)=>{
    await ctx.render('article');
});
//添加文章-数据
router.post('/add',async (ctx)=> {
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
router.get('/login',async(ctx)=>{
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
router.post('/login',async (ctx)=>{
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

//查看文章-路由
router.get('/articleDetails/:aid',async(ctx)=>{
    let aid = ctx.params.aid,
        res,
        ress;
    await sql.findDataById(aid)
        .then(result => {
            res = result[0];
        });
    await sql.findCommentById(aid)
        .then(result => {
            ress = result;
            console.log(ress);
        });
    await ctx.render('articleDetails', {
        title: res.title,
        content: res.content,
        category: res.category,
        id: res.id,
        coments: ress
    })
});
router.post('/articleDetails/:aid',async(ctx)=>{
    let name = ctx.request.body.name,
        content = ctx.request.body.content,
        avator = ctx.request.body.avator,
        postId = ctx.params.aid,
        time = moment().format('YYYY-MM-DD HH:mm:ss');
    let base64Data = avator.replace(/^data:image\/\w+;base64,/, ""),
        dataBuffer = new Buffer(base64Data, 'base64'),
        getName = Number(Math.random().toString().substr(3)).toString(36) + Date.now(),
        upload = await new Promise((reslove, reject) => {
            fs.writeFile('./public/images/' + getName + '.png', dataBuffer, err => {
                if (err) {
                    throw err;
                    reject(false);
                }
                reslove(true);
                console.log('头像上传成功');
            })
        })
    await sql.insertComment([name, md.render(content), time, postId, getName + '.png'])
    await sql.addPostCommentCount(postId)
        .then(() => {
            ctx.body = {
                code:200,
                message:'评论成功'
            }
        }).catch(() => {
            ctx.body = {
                code: 500,
                message: '评论失败'
            }
        })
})











//评论列表接口（http://localhost:3000/comments）
router.get('/comments',async(ctx)=>{
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

//文章列表接口（http://localhost:3000/messages）
router.get('/messages',async(ctx)=>{
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
