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
                reject( err )
            } else {
                connection.query(sql, values, ( err, rows) => {
                    if ( err ) {
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

let posts =
    `create table if not exists posts(
     id INT NOT NULL AUTO_INCREMENT,
     title TEXT(0) NOT NULL COMMENT '文章题目',
     category TEXT(0) NOT NULL COMMENT '文章类别',
     content TEXT(0) NOT NULL COMMENT '文章内容',
     moment VARCHAR(100) NOT NULL COMMENT '发表时间',
     PRIMARY KEY(id)
    );`
let comment =
    `create table if not exists comment(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL COMMENT '用户名称',
     content TEXT(0) NOT NULL COMMENT '评论内容',
     moment VARCHAR(40) NOT NULL COMMENT '评论时间',
     postid VARCHAR(40) NOT NULL COMMENT '文章id',
     avator VARCHAR(100) NOT NULL COMMENT '用户头像',
     PRIMARY KEY(id) 
    );`

let createTable = ( sql ) => {
    return query( sql, [] )
}
//创建文章表
createTable(posts)
createTable(comment)
// 发表文章
exports.insertPosts = ( value ) => {
    let _sql = "insert into posts set title=?,category=?,content=?,moment=?;"
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
    let _sql = "insert into comment set name=?,content=?,moment=?,postid=?,avator=?;"
    return query( _sql, value )
}
// 通过文章id查找评论
exports.findCommentById =  ( id ) => {
    let _sql = `select * from comment where postid="${id}";`
    return query( _sql)
}
// 通过文章id查找评论数
exports.findCommentCountById =  ( id ) => {
    let _sql = `select count(*) as count from comment where postid="${id}";`
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