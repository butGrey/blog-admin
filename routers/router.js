const router = require('koa-router')();
//const common = require('../module/common.js');
const config = require('../config/default.js');
const sql = require('../lib/mysql.js');
const moment = require('moment');
const fs = require('fs');
const multer = require('koa-multer');
const md5 = require('md5');
const md = require('markdown-it')();
const path = require('path');
const checkNotLogin = require('../middlewares/check.js').checkNotLogin
const checkLogin = require('../middlewares/check.js').checkLogin

//以下是配置
var storage = multer.diskStorage({
    //定义文件保存路径
    destination:function(req,file,cb){
        cb(null,'./public/images/');//路径根据具体而定。如果不存在的话会自动创建一个路径
    },
    filename:function(req,file,cb){ //修改文件名
        var fileFormat = (file.originalname).split(".");
        cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
})

var upload = multer({ storage: storage });

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
router.post('/article_adds',upload.single('img'),async (ctx, next)=> {
    let {title, category, content} = ctx.req.body;
    let time = moment().format('YYYY-MM-DD HH:mm:ss');

    await  sql.insertPosts([title, category, content, time, ctx.req.file.filename])
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
    console.log('-----------------')
    let aid = ctx.params.aid,
        res,
        ress,
        resss;
    await sql.findDataById(aid)
        .then(result => {
            res = result[0];
        });
    await sql.findCommentByIdD(aid)
        .then(result => {
            ress = result;
        });
    await sql.findCommentsReplyById(aid)
        .then(result => {
            resss = result;
        });
    let data = {
        title: res.title,
        content: res.content,
        category: res.category,
        id: res.id,
        comments: ress,
        commentreply: resss
    }
    console.log(data)
    await ctx.render('article_detail', data)
});
//评论-添加
router.post('/article_detail/:aid',async(ctx)=>{
    let name = ctx.request.body.name,
        content = ctx.request.body.content,
        avator = ctx.request.body.avator,
        commentid = ctx.params.aid,
        postId = ctx.request.body.postid,
        rpname = ctx.request.body.rpname,
        time = moment().format('YYYY-MM-DD HH:mm:ss');
    if(postId){
        await sql.insertCommentReply([rpname, postId, name, md.render(content), time, commentid, avator])
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
    }else{
        await sql.insertComment([name, md.render(content), time, commentid, avator])
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
    }

})
//评论-删除
router.post('/article_detail/:aid/comment_delete/:ids',async(ctx)=>{
    let postId = ctx.params.id,
        commentId = ctx.params.ids;
    await sql.deleteComment(commentId)
        .then(() => {
            ctx.body = {
                code: 200,
                message: '删除子评论成功'
            }
        }).catch(() => {
            ctx.body = {
                code: 500,
                message: '删除子评论失败'
            }
        })
    await sql.deleteCommentReplys(commentId)
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
//评论-回复-删除
router.post('/article_detail/:aid/commentreply_delete/:id',async(ctx)=>{
    let postId = ctx.params.aid,
        commentreplyId = ctx.params.id;
    console.log(commentreplyId)
    await sql.deleteCommentReply(commentreplyId)
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
    await sql.findAllMessagesD()
        .then(result => {
            res = result;
        });
    await sql.findAllMessagesReply()
        .then(result => {
            ress = result;
            console.log(ress)
        });
    await ctx.render('message', {
        messages: res,
        messagereply:ress
    })
});
//留言-添加
router.post('/message',async(ctx)=>{
    let name = ctx.request.body.name,
        content = ctx.request.body.content,
        avator = ctx.request.body.avator,
        postid = ctx.request.body.postid,
        rpname = ctx.request.body.rpname,
        time = moment().format('YYYY-MM-DD HH:mm:ss');
    if(postid){
        await sql.insertMessageReply([rpname, name, md.render(content), time, postid, avator])
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
        await sql.insertMessage([name, md.render(content), time, avator])
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
    await sql.deleteMessageReplys(messageId)
        .then(() => {
            ctx.body = {
                code: 200,
                message: '删除子留言成功'
            }
        }).catch(() => {
            ctx.body = {
                code: 500,
                message: '删除子留言失败'
            }
        })
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

//用户-查看
router.get('/user',async(ctx)=>{
    let res;
    await sql.findAllUser()
        .then(result => {
            res = result;
        });
    await ctx.render('user', {
        users: res
    })
});
//用户-添加
router.post('/user',async(ctx)=>{
    let name = ctx.request.body.name,
        content = ctx.request.body.content,
        avator = ctx.request.body.avator,
        email = ctx.request.body.email,
        url = ctx.request.body.url,
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
    await sql.insertUser([name, md.render(content), time, email, url, getName + '.png'])
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
});
//用户-删除
router.post('/user/:ids',async(ctx)=>{
    let messageId = ctx.params.ids;
    await sql.deleteUser(messageId)
        .then(() => {
            ctx.body = {
                code: 200,
                message: '删除子留言成功'
            }
        }).catch(() => {
            ctx.body = {
                code: 500,
                message: '删除子留言失败'
            }
        })
})
//用户列表接口（http://localhost:3000/users）
router.get('/users',async(ctx)=>{
    await sql.findAllUser()
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
//留言回复接口（http://localhost:3000/messagereplys）
router.get('/messagereplys',async(ctx)=>{
    await sql.findAllMessagesReply()
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
//评论回复接口（http://localhost:3000/comments）
router.get('/commentreplys/:id',async(ctx)=>{
    let id = ctx.params.id;
    console.log(id)
    await sql.findCommentsReplyById(id)
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
        .then(res => {z
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取列表失败'
            }
        })
});
//文章详情接口（http://localhost:3000/articles/:aid）
router.get('/getArticleDetail/:aid',async(ctx)=>{
    let aid = ctx.params.aid,
        res,
        ress,
        resss;
    await sql.findDataById(aid)
        .then(result => {
            res = result[0];
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: 'failure'
            }
        });
    await sql.findCommentByIdD(aid)
        .then(result => {
            ress = result;
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: 'failure'
            }
        });
    await sql.findCommentsReplyById(aid)
        .then(result => {
            resss = result;
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: 'failure'
            }
        });
    let data = {
        title: res.title,
        content: res.content,
        category: res.category,
        id: res.id,
        comments: ress,
        commentreply: resss
    }
    console.log(data)
    ctx.body = {
        code: 200,
        data: data,
        message:'success'
    };
});

//主页面展示所有文章
router.get('/account',async(ctx)=>{
    let accounts;
    await sql.findAllAccount()
        .then(res => {
            accounts = res;
            console.log(accounts)
        });
    await ctx.render('sales_platform',{
        accounts:accounts,
        session: ctx.session
    })
});
//主页面删改文章
router.post('/account_del',async(ctx)=>{
    let {id} = ctx.request.body;
    await checkNotLogin(ctx);
    await sql.deleteAccountData(id)
        .then(()=>{
            ctx.body = {
                code: 200,
                message: '删除文章成功'
            }
        }).catch(()=> {
            ctx.body = {
                code: 500,
                message: '删除文章失败,请登录！'
            }
        })
});
//添加账号-路由
router.get('/account_add',async(ctx)=>{
    await checkNotLogin(ctx);
    await ctx.render('account_add',{
        session: ctx.session
    });
});
//添加账号-数据
router.post('/account_add',async (ctx)=> {
    let {name,price,sect,body,areaclothing,faction,equipment,superequipment,exterior,album,descript} = ctx.request.body;
    let time = moment().format('YYYY-MM-DD HH:mm:ss');
    await  sql.insertAccountData([name,price,sect,body,areaclothing,faction,equipment,superequipment,exterior,album,descript])
        .then(()=> {
            ctx.body = {
                code: 200,
                message: '上传账号成功'
            }
        }).catch(()=> {
            ctx.body = {
                code: 500,
                message: '上传账号失败'
            }
        })
});
//查看账号-路由
router.get('/account_detail/:aid',async(ctx)=>{
    await checkNotLogin(ctx);
    let aid = ctx.params.aid,
        res,
        ress,
        resss;
    await sql.findAccountData(aid)
        .then(result => {
            res = result[0];
        });
    await ctx.render('account_detail', {
        title: res.title,
        content: res.content,
        category: res.category,
        id: res.id,
        comments: ress,
        commentreply: resss
    })
});
//用户登出
router.get('/signout', async ctx => {
    ctx.session = null;
    console.log('登出成功')
    ctx.body = true
})

//用户注册
router.get('/sign', async ctx => {
    await checkLogin(ctx);
    await ctx.render('login', {
        session: ctx.session,
    })
})
router.post('/sign', async ctx => {
    let { name, password, repeatpass} = ctx.request.body
    console.log(typeof password)
    await sql.findDataCountByName(name)
        .then(async (result) => {
            console.log(result)
            if (result[0].count >= 1) {
                // 用户存在
                ctx.body = {
                    code: 500,
                    message: '用户存在'
                };
            } else if (password !== repeatpass || password.trim() === '') {
                ctx.body = {
                    code: 500,
                    message: '两次输入的密码不一致'
                };
            }else {
                await sql.insertData([name, md5(password)])
                    .then(res => {
                        console.log('注册成功', res)
                        //注册成功
                        ctx.body = {
                            code: 200,
                            message: '注册成功'
                        };
                    })
            }
        })

})

//用户-注册/添加
/*验证用户名是否重复*/
router.get('/checkusername/:name', async ctx => {
    let name = ctx.params.name;
    console.log(name);
    await sql.findByName(name)
        .then((res) => {
            console.log(res.length);
            if(res.length){
                ctx.body = {
                    code:200,
                    message:'用户名重复'
                }
            }else{
                ctx.body = {
                    code:201,
                    message:'用户名不重复'
                }
            }
        }).catch(() => {
            ctx.body = {
                code: 500,
                message: '异常'
            }
        })
});

router.post('/addbloguser',async(ctx)=>{
    let name = ctx.request.body.name,
        password = ctx.request.body.password,
        avator = ctx.request.body.avator,
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
    await sql.addUser([name, md5(password), time, getName + '.png'])
        .then(() => {
            ctx.body = {
                code:200,
                data: getName + '.png',
                message:'注册成功'
            }
        }).catch(() => {
            ctx.body = {
                code: 500,
                message: '注册失败'
            }
        })
})

//用户登录
/*根据用户名获取用户头像*/
router.get('/getavator/:name', async ctx => {
    let name = ctx.params.name;
    await sql.findByName(name)
        .then((res) => {
            ctx.body = {
                code:200,
                data: res[0].avator,
                message:'获取成功'
            }
        }).catch(() => {
            ctx.body = {
                code: 500,
                message: '无此用户，获取失败'
            }
        })
});

router.get('/loginin', async ctx => {
    await checkLogin(ctx);
    await ctx.render('loginin', {
        session: ctx.session,
    })
})
router.post('/loginin', async ctx => {
    console.log(ctx.request.body)
    let { name, password } = ctx.request.body
    await sql.findByName(name)
        .then(result => {
            let res = result;
            if (res.length && name === res[0]['name'] && md5(password) === res[0]['password']) {
                ctx.session = {
                    user: res[0]['name'],
                    id: res[0]['id']
                };
                ctx.body = {
                    code: 200,
                    message: '登录成功'
                };
                console.log('ctx.session.id', ctx.session.id)
                console.log('session', ctx.session)
                console.log('登录成功')
            } else {
                ctx.body = {
                    code: 500,
                    message: '用户名或密码错误'
                }
                console.log('用户名或密码错误!')
            }
        }).catch(err => {
            console.log(err)
        });
})

module.exports =router.routes();
