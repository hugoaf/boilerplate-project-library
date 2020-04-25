/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        let db = client.db('library');
        var collection = db.collection('books');
        let result = [];
        let query = {};

        collection.find(query).toArray(function(err,docs){
          docs.map( book =>{
            book.commentcount = ('comments' in book) ? book.comments.length : 0;
            delete book.comments;
            result.push(book);
          })
          res.json(result);
        });
      });
    
    
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title

      // required fields
      if(!title) {
        res.send("missing title");
      } else {

        let book = {
          title : title,
          comments : []
        }
  
        MongoClient.connect(CONNECTION_STRING, function(err, client) {
          let db = client.db('library');
          var collection = db.collection('books');
          collection.insertOne(book, function(err,doc){
            book._id = doc.insertedId;
            res.json(book);
          });
        });

      }

    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        let db = client.db('library');
        var collection = db.collection('books');
        collection.deleteMany({}, (err,docs)=>{
          if(err) {
            res.send('error in delete');
          } else {
            res.send('complete delete successful');
          }
        });
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        let db = client.db('library');
        var collection = db.collection('books');
        if( String(bookid).length !== 24 ){
          res.send('wrong id');
        } else {
          let query = {
            _id: new ObjectId(bookid)
          };
  
          collection.findOne(query, (err,book)=>{
            if(err){
              res.send('error');
            } else {
              if (!book) {
                res.send('no book exists');
              } else {
                //console.log('book found: ', book);
                book.comments = ('comments' in book) ? book.comments : [];
                res.json(book);                
              }
            }
          });
        }
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get

      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        let db = client.db('library');
        var collection = db.collection('books');
        let query = {
          _id: new ObjectId(bookid)
        };

        collection.findOne(query, (err,book)=>{
          book.comments = ('comments' in book) ? book.comments : [];
          book.comments.push(comment);
          collection.findAndModify({_id:new ObjectId(bookid)}, [['_id','asc']], {$set: book}, function(err,doc){
            if(err) {
              res.send("could not update" + bookid);
            }
            res.json(book);
          });
        });
      });
    })
      
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
            // required fields
            if(!bookid) {
              res.send("_id error");
            } 
            else {
              MongoClient.connect(CONNECTION_STRING, function(err, client) {
                let db = client.db("library");
                var collection = db.collection('books');
                collection.deleteOne({_id: ObjectId(bookid)}, function(err,doc){
                  if(err) {
                    res.send("could not delete " + bookid);
                  }
                  res.send("delete successful");
      
                });
              });
            } 
    });
  
};
