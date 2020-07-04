var mysql = require('mysql');
var config = require('../config/default.js')

var pool  = mysql.createPool({
    host     : config.database.HOST,
    user     : config.database.USERNAME,
    password : config.database.PASSWORD,
    database : config.database.DATABASE,
    port     : config.database.PORT
});

let query = ( sql, values ) => {
    return new Promise(( resolve, reject ) => {
        pool.getConnection( (err, connection) => {
            if (err) {
                console.log('---------------'+err.message+'---------------');
                reject( err )
            } else {
                connection.query(sql, values, ( err, rows) => {
                    if ( err ) {
                        console.log(err.message);
                        reject( err )
                    } else {
                        resolve( rows )
                    }
                    connection.release()
                })
            }
        })
    })
}
let users =
    `create table if not exists users(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL COMMENT '用户名',
     pass VARCHAR(100) NOT NULL COMMENT '密码',
     PRIMARY KEY ( id )
    );`
let user =
    `create table if not exists user(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL COMMENT '用户名称',
     content TEXT(0) NOT NULL COMMENT '个性签名',
     moment VARCHAR(40) NOT NULL COMMENT '加入时间',
     avator VARCHAR(100) NOT NULL COMMENT '用户头像',
     url VARCHAR(100) NOT NULL COMMENT '用户url',
     email VARCHAR(100) NOT NULL COMMENT '用户email',
     PRIMARY KEY(id) 
    );`
let bloguser =
    `create table if not exists bloguser(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL COMMENT '用户名称',
     password VARCHAR(100) NOT NULL COMMENT '用户密码',
     moment VARCHAR(40) NOT NULL COMMENT '加入时间',
     avator VARCHAR(100) NOT NULL COMMENT '用户头像',
     PRIMARY KEY(id) 
    );`
let posts =
    `create table if not exists posts(
     id INT NOT NULL AUTO_INCREMENT,
     title TEXT(0) NOT NULL COMMENT '文章题目',
     category TEXT(0) NOT NULL COMMENT '文章类别',
     content TEXT(0) NOT NULL COMMENT '文章内容',
     moment VARCHAR(100) NOT NULL COMMENT '发表时间',
     img VARCHAR(255) COMMENT '图片',
     PRIMARY KEY(id)
    );`
let comment =
    `create table if not exists comment(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL COMMENT '用户名称',
     content TEXT(0) NOT NULL COMMENT '评论内容',
     moment VARCHAR(40) NOT NULL COMMENT '评论时间',
     commentid VARCHAR(40) NOT NULL COMMENT '文章id',
     avator VARCHAR(255) NOT NULL COMMENT '用户头像',
     PRIMARY KEY(id) 
    );`
let message =
    `create table if not exists message(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL COMMENT '用户名称',
     content TEXT(0) NOT NULL COMMENT '留言内容',
     moment VARCHAR(40) NOT NULL COMMENT '留言时间',
     avator VARCHAR(255) NOT NULL COMMENT '用户头像',
     PRIMARY KEY(id) 
    );`
let commentreplay =
    `create table if not exists commentreplay(
     id INT NOT NULL AUTO_INCREMENT,
     rpname VARCHAR(100) NOT NULL COMMENT '回复用户名称',
     postid VARCHAR(40) NOT NULL COMMENT '回复评论id',
     name VARCHAR(100) NOT NULL COMMENT '用户名称',
     content TEXT(0) NOT NULL COMMENT '评论内容',
     moment VARCHAR(40) NOT NULL COMMENT '评论时间',
     commentid VARCHAR(40) NOT NULL COMMENT '文章id',
     avator VARCHAR(255) NOT NULL COMMENT '用户头像',
     PRIMARY KEY(id) 
    );`
let messagereplay =
    `create table if not exists messagereplay(
     id INT NOT NULL AUTO_INCREMENT,
     rpname VARCHAR(100) NOT NULL COMMENT '回复用户名称',
     name VARCHAR(100) NOT NULL COMMENT '用户名称',
     content TEXT(0) NOT NULL COMMENT '评论内容',
     moment VARCHAR(40) NOT NULL COMMENT '评论时间',
     postid VARCHAR(40) NOT NULL COMMENT '留言id',
     avator VARCHAR(255) NOT NULL COMMENT '用户头像',
     PRIMARY KEY(id) 
    );`
let account =
    `create table if not exists account(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL COMMENT '账号索引',
     price VARCHAR(40) NOT NULL COMMENT '价格',
     sect VARCHAR(40) NOT NULL COMMENT '门派',
     body VARCHAR(40) NOT NULL COMMENT '体型',
     areaclothing VARCHAR(40) NOT NULL COMMENT '区服',
     faction VARCHAR(40) NOT NULL COMMENT '阵营',
     equipment VARCHAR(40) NOT NULL COMMENT '装备',
     superequipment VARCHAR(40) NOT NULL COMMENT '橙武',
     exterior VARCHAR(100) NOT NULL COMMENT '外观',
     album VARCHAR(100) NOT NULL COMMENT '图片',
     descript VARCHAR(100) NOT NULL COMMENT '简述',
     PRIMARY KEY(id) 
    );`

let createTable = ( sql ) => {
    return query( sql, [] )
}
//创建文章表
createTable(posts)
createTable(comment)
createTable(message)
createTable(commentreplay)
createTable(messagereplay)
createTable(user)
createTable(account)
createTable(users)
createTable(bloguser)
// 注册用户
exports.insertData = ( value ) => {
    let _sql = "insert into users set name=?,pass=?;"
    return query( _sql, value )
}
// 删除用户
exports.deleteUserData = ( name ) => {
    let _sql = `delete from users where name="${name}";`
    return query( _sql )
}
// 查找用户
exports.findUserData = ( name ) => {
    let _sql = `select * from users where name="${name}";`
    return query( _sql )
}
// 通过名字查找用户
exports.findDataByName =  ( name ) => {
    let _sql = `select * from users where name="${name}";`
    return query( _sql)
}
// 通过名字查找用户数量判断是否已经存在
exports.findDataCountByName =  ( name ) => {
    let _sql = `select count(*) as count from users where name="${name}";`
    return query( _sql)
}
// 添加账号
exports.insertAccountData = ( value ) => {
    let _sql = "insert into account set name=?,price=?,sect=?,body=?,areaclothing=?,faction=?,equipment=?,superequipment=?,exterior=?,album=?,descript=?;"
    return query( _sql, value )
}
// 删除账号
exports.deleteAccountData = ( id ) => {
    let _sql = `delete from account where id="${id}";`
    return query( _sql )
}
// 查找账号
exports.findAccountData = ( name ) => {
    let _sql = `select * from account where name="${name}";`
    return query( _sql )
}
// 查询所有账号
exports.findAllAccount = () => {
    let _sql = `select * from account;`
    return query( _sql)
}
// 发表文章
exports.insertPosts = ( value ) => {
    let _sql = "insert into posts set title=?,category=?,content=?,moment=?,img=?;"
    return query( _sql, value )
}
// 通过文章id查找
exports.findDataById =  ( id ) => {
    let _sql = `select * from posts where id="${id}";`
    return query( _sql)
}
// 查询所有文章
exports.findAllPosts = () => {
    let _sql = `select * from posts;`
    return query( _sql)
}
// 查询所有文章倒序
exports.findAllPostsD = () => {
    let _sql = `select * from posts order by 1 desc;`
    return query( _sql)
}
// 删除文章
exports.deletePosts = (id) => {
    let _sql = `delete from posts where id = ${id}`
    return query(_sql)
}
// 更新修改文章
exports.updatePost = (values) => {
    let _sql = `update posts set title=?,content=?,category=? where id=?`
    return query(_sql,values)
}
// 增加文章评论数
exports.addPostCommentCount = ( value ) => {
    let _sql = "update posts set comments = comments + 1 where id=?"
    return query( _sql, value )
}
// 减少文章评论数
exports.reducePostCommentCount = ( value ) => {
    let _sql = "update posts set comments = comments - 1 where id=?"
    return query( _sql, value )
}
// 发表评论
exports.insertComment = ( value ) => {
    let _sql = "insert into comment set name=?,content=?,moment=?,commentid=?,avator=?;"
    return query( _sql, value )
}
// 通过文章id查找评论
exports.findCommentById =  ( id ) => {
    let _sql = `select * from comment where commentid="${id}";`
    return query( _sql)
}
// 通过文章id查找评论
exports.findCommentByIdD =  ( id ) => {
    let _sql = `select * from comment where commentid="${id}" order by 1 desc;`
    return query( _sql)
}
// 通过文章id查找评论数
exports.findCommentCountById =  ( id ) => {
    let _sql = `select count(*) as count from comment where commentid="${id}";`
    return query( _sql)
}
// 通过评论id查找
exports.findComment = ( id ) => {
    let _sql = `select * from comment where id="${id}";`
    return query( _sql)
}
// 删除评论
exports.deleteComment = (id) => {
    let _sql = `delete from comment where id=${id}`
    return query(_sql)
}

// 查询留言
exports.findAllMessages = () => {
    let _sql = `select * from message;`
    return query( _sql)
}
// 查询留言
exports.findAllMessagesD = () => {
    let _sql = `select * from message order by 1 desc;`
    return query( _sql)
}
// 发表留言
exports.insertMessage = ( value ) => {
    let _sql = "insert into message set name=?,content=?,moment=?,avator=?;"
    return query( _sql, value )
}
// 删除留言
exports.deleteMessage = (id) => {
    let _sql = `delete from message where id=${id}`
    return query(_sql)
}
// 查询pl
exports.findAllCommentsReply = () => {
    let _sql = `select * from commentreplay;`
    return query( _sql)
}
// 通过文章id查找评论
exports.findCommentsReplyById =  ( id ) => {
    let _sql = `select * from commentreplay where commentid="${id}";`
    return query( _sql)
}
// 发表
exports.insertCommentReply = ( value ) => {
    let _sql = "insert into commentreplay set rpname=?,postid=?,name=?,content=?,moment=?,commentid=?,avator=?;"
    return query( _sql, value )
}
// 删除
exports.deleteCommentReply = (id) => {
    let _sql = `delete from commentreplay where id=${id}`
    return query(_sql)
}
// 通过评论ID删除回复
exports.deleteCommentReplys = (id) => {
    let _sql = `delete from commentreplay where postid=${id}`
    return query(_sql)
}
// 查询ly
exports.findAllMessagesReply = () => {
    let _sql = `select * from messagereplay;`
    return query( _sql)
}
// 通过留言id查找评论
exports.findMessagesReplyById =  ( id ) => {
    let _sql = `select * from messagereplay where postid="${id}";`
    return query( _sql)
}
// 发表
exports.insertMessageReply = ( value ) => {
    let _sql = "insert into messagereplay set rpname=?,name=?,content=?,moment=?,postid=?,avator=?;"
    return query( _sql, value )
}
// 删除
exports.deleteMessageReply = (id) => {
    let _sql = `delete from messagereplay where id=${id}`
    return query(_sql)
}
// 通过留言ID删除回复
exports.deleteMessageReplys = (postid) => {
    let _sql = `delete from messagereplay where postid=${postid}`
    return query(_sql)
}
// 发表
exports.insertUser = ( value ) => {
    let _sql = "insert into user set name=?,content=?,moment=?,email=?,url=?,avator=?;"
    return query( _sql, value )
}
// 删除
exports.deleteUser = (id) => {
    let _sql = `delete from user where id=${id}`
    return query(_sql)
}
// 通过留言id查找评论
exports.findAllUser =  () => {
    let _sql = `select * from user;`
    return query( _sql)
}
// 创建用户
exports.addUser = ( value ) => {
    let _sql = "insert into bloguser set name=?,password=?,moment=?,avator=?;"
    return query( _sql, value )
}
// 通过名字查找用户
exports.findByName =  ( name ) => {
    let _sql = `select * from bloguser where name="${name}";`
    return query( _sql)
}
