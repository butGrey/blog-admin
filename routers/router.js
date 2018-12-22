const router = require('koa-router')();
//const common = require('../module/common.js');
const config = require('../config/default.js');
const sql = require('../lib/mysql.js');
const moment = require('moment');
const fs = require('fs');
const md = require('markdown-it')();
const path = require('path');

//主页面展示所有文章
router.get('/art',async(ctx)=>{
    let articles;
    await sql.findAllPostsD()
        .then(res => {
            articles = res
        });
    await ctx.render('home',{
        articles:articles
    })
});
//主页面删改文章
router.post('/art',async(ctx)=>{
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
router.get('/article_revise/:aid',async(ctx)=>{
    let aid = ctx.params.aid,
        res;
    await sql.findDataById(aid)
        .then(result => {
            res = result[0];
        });
    await ctx.render('article_revise', {
        title: res.title,
        content: res.content,
        category: res.category
    })
});
//修改文章-数据
router.post('/article_revise/:aid',async(ctx)=>{
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
router.get('/article_add',async(ctx)=>{
    await ctx.render('article_add');
});
//添加文章-数据
router.post('/article_add',async (ctx)=> {
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
//查看文章-路由
router.get('/article_detail/:aid',async(ctx)=>{
    let aid = ctx.params.aid,
        res,
        ress;
    await sql.findDataById(aid)
        .then(result => {
            res = result[0];
        });
    await sql.findCommentByIdD(aid)
        .then(result => {
            ress = result;
        });
    await ctx.render('article_detail', {
        title: res.title,
        content: res.content,
        category: res.category,
        id: res.id,
        comments: ress
    })
});
//评论-添加
router.post('/article_detail/:aid',async(ctx)=>{
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
            })
        })
    await sql.insertComment([name, md.render(content), time, postId, getName + '.png'])
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
//评论-删除
router.post('/article_detail/:aid/comment_delete/:ids',async(ctx)=>{
    let postId = ctx.params.id,
        commentId = ctx.params.ids;
    await sql.deleteComment(commentId)
        .then(() => {
            ctx.body = {
                code: 200,
                message: '删除评论成功'
            }
        }).catch(() => {
            ctx.body = {
                code: 500,
                message: '删除评论失败'
            }
        })
})

//留言-查看
router.get('/message',async(ctx)=>{
    let res,ress;
    await sql.findAllMessages()
        .then(result => {
            res = result;
        });
    await ctx.render('message', {
        messages: res
    })
});
//留言-添加
router.post('/message',async(ctx)=>{
    let name = ctx.request.body.name,
        content = ctx.request.body.content,
        avator = ctx.request.body.avator,
        postid = '',
        rpname = ctx.request.body.rpname,
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
    if(postid){
        await sql.insertMessageReply([rpname, name, md.render(content), time, postid, getName + '.png'])
            .then(() => {
                ctx.body = {
                    code:200,
                    message:'留言成功'
                }
            }).catch(() => {
                ctx.body = {
                    code: 500,
                    message: '留言失败'
                }
            })
    }else {
        await sql.insertMessage([name, md.render(content), time, getName + '.png'])
            .then(() => {
                ctx.body = {
                    code:200,
                    message:'留言成功'
                }
            }).catch(() => {
                ctx.body = {
                    code: 500,
                    message: '留言失败'
                }
            })
    }
})
//留言-删除
router.post('/message/:ids',async(ctx)=>{
    let messageId = ctx.params.ids;
    await sql.deleteMessage(messageId)
        .then(() => {
            ctx.body = {
                code: 200,
                message: '删除留言成功'
            }
        }).catch(() => {
            ctx.body = {
                code: 500,
                message: '删除留言失败'
            }
        })
})
//留言-回复-删除
router.post('/messagereply/:ids',async(ctx)=>{
    let messageReplyId = ctx.params.ids;
    await sql.deleteMessageReply(messageReplyId)
        .then(() => {
            ctx.body = {
                code: 200,
                message: '删除留言成功'
            }
        }).catch(() => {
            ctx.body = {
                code: 500,
                message: '删除留言失败'
            }
        })
})






//留言列表接口（http://localhost:3000/messages）
router.get('/messages',async(ctx)=>{
    await sql.findAllMessagesD()
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
//评论列表接口（http://localhost:3000/comments）
router.get('/comments/:id',async(ctx)=>{
    let id = ctx.params.id;
    await sql.findCommentByIdD(id)
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
//文章列表接口（http://localhost:3000/articles）
router.get('/articles',async(ctx)=>{
    await sql.findAllPostsD()
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
