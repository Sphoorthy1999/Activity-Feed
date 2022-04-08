const express = require('express');
const mysql = require('mysql');
var bodyParser = require('body-parser');
const { NULL } = require('mysql/lib/protocol/constants/types');

const app = express();

app.use(bodyParser.json());

app.listen('5556', () =>{
    console.log('server started on port 5556');
});

const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'password',
    database: 'activityfeed'
});

db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Mysql connected ...');
});



app.post('/adduser', (req,res) => {
    user = {
        fullname:req.body.fullname,
        email:req.body.email
    };
    let sql = 'INSERT into users SET ?'
    let query = db.query(sql,user,(err,result) => {
        if(err) throw err;
        res.status(200).send({"message":"user added","user":user})
    });
});

app.post('/createpost', (req,res) => {
    post = {
        title:req.body.title,
        content:req.body.content,
        userid:req.body.userid
    };
    let sql = 'INSERT into posts SET ?'
    let query = db.query(sql,post,(err,result) => {
        if(err) throw err;
        res.status(200).send({"message":"post added","post":post})
    });
});

app.post('/commentpost', (req,res) => {
    comment = {
        com_text:req.body.com_text,
        postid:req.body.postid,
        userid:req.body.userid
    };
    let sql= 'SELECT * FROM comments WHERE com_text = ? AND postid = ? AND userid = ?'
    let query = db.query(sql,[req.body.com_text,req.body.postid,req.body.userid],(err,result) => {
            if(result.length!=0){
                res.status(400).send({"message":"Already commented"})
            }
            else{
            let sql = 'INSERT into comments SET ?'
            let query = db.query(sql,comment,(err,result) => {
            if(err) throw err;
             res.status(200).send({"message":"comment added","post":comment})
             });
            }
        });
});

app.post('/like', (req,res) => {
    like = {
        entity_type:req.body.entity_type,
        postid:req.body.postid,
        commentid:req.body.commentid,
        userid:req.body.userid
    };
    if(req.body.commentid == undefined){
        let sql= 'SELECT * FROM likes WHERE entity_type = ? AND postid = ? AND userid = ?'
        let query = db.query(sql,[req.body.entity_type,req.body.postid,req.body.userid],(err,result) => {
            console.log(result);
            if(result.length!=0){
                console.log('hi');
                res.status(400).send({"message":"Already liked"})
            }
            else{
            let sql = 'INSERT into likes SET ?'
            let query = db.query(sql,like,(err,result) => {
            if(err) throw err;
             res.status(200).send({"message":"likes added","post":like})
             });
            }
        });
    }
    else{
        let sql= 'SELECT * FROM likes WHERE entity_type = ? AND postid = ? AND userid = ? AND commentid = ?'
        let query = db.query(sql,[req.body.entity_type,req.body.postid,req.body.userid,req.body.commentid],(err,result) => {
            if(result.length!=0){
                res.status(400).send({"message":"Already liked"})
            }
            else{
            let sql = 'INSERT into likes SET ?'
            let query = db.query(sql,like,(err,result) => {
            if(err) throw err;
             res.status(200).send({"message":"likes added","post":like})
             });
            }
        });
    }
});

app.get('/users_comment', (req,res) => {
    postid=req.query.postid
    // let sql = 'SELECT userid FROM comments WHERE postid= ? ORDER BY id DESC'
    let sql = 'SELECT userid,fullname FROM users left join comments on users.id = comments.userid WHERE postid= ? ORDER BY comments.id DESC'
    let query = db.query(sql,postid,(err,result) => {
        if(err) throw err;
        res.status(200).send({"message":"users fetched","post":result})
    });
});

app.get('/users_postlike', (req,res) => {
    postid=req.query.postid
    //let sql = 'SELECT * FROM likes WHERE postid= ? ORDER BY id DESC'
    let sql = 'SELECT userid,fullname FROM users left join likes on users.id = likes.userid WHERE postid= ? ORDER BY likes.id DESC'
    let query = db.query(sql,postid,(err,result) => {
        if(err) throw err;
        res.status(200).send({"message":"users fetched","post":result})
    });
});

app.get('/users_commentlike', (req,res) => {
    console.log(req.query.commentid)
    commentid=req.query.commentid
    //let sql = 'SELECT * FROM likes WHERE comment= ? ORDER BY id DESC'
    let sql = 'SELECT userid,fullname FROM users left join likes on users.id = likes.userid WHERE commentid= ? ORDER BY likes.id DESC'
    let query = db.query(sql,commentid,(err,result) => {
        if(err) throw err;
        res.status(200).send({"message":"users fetched","post":result})
    });
});
