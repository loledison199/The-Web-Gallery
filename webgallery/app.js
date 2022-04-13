const express = require('express');
const app = express();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('static'));

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

var Datastore = require('nedb')
  , comments = new Datastore({ filename: 'db/comments.db', autoload: true, timestampData : true})
  , images = new Datastore({ filename: 'db/images.db', autoload: true, timestampData : true });

var Comments = (function(){
    var id = 0;
    return function item(comment){
        this._id = id++;
        this.content = comment.content;
        this.imageId = comment.imageId;
        this.author = comment.author;
    }
}());

var img_id = 0;

// Create

//addImage
app.post('/api/images/', upload.single('picture'), function (req, res, next) {
    images.insert({_id: img_id++, title: req.body.title, author: req.body.author, picture: req.file}, function (err, image) {
        if (err) return res.status(500).end(err);
        return res.json(image);
    });
    //users[req.body.username] = req.picture;
});

//addComment
app.post('/api/comments/', function (req, res, next) {
    var comment = new Comments(req.body);
    console.log(req.body);
    comments.insert(comment, function(err, message){
        if (err) return res.status(500).end(err);
    })
    return res.json(comment);
});

// Read

//hasImage
app.get('/api/images/hasimage/', function (req, res, next) {
    images.find({}).sort({createdAt:-1}).limit(1).exec(function(err, imgs) { 
        if (err) return res.status(500).end(err);
        console.log(imgs);
        if (imgs.length === 0) return res.json({_id: -1});
        console.log("here");
        return res.json(imgs[0]);
    });
})

//getNextImage
app.get('/api/images/nextimage/:id', function (req, res, next) {
    images.find({_id: {$gt: parseInt(req.params.id, 10)}}).sort({createdAt:1}).limit(1).exec(function(err, image){
        if (err) return res.status(500).end(err);
        console.log(image);
        if (image.length === 0) return res.json({_id: -1});
        return res.json(image[0]);
    })
})

//getPrevImage
app.get('/api/images/previmage/:id', function (req, res, next) {
    images.find({_id: {$lt: parseInt(req.params.id, 10)}}).sort({createdAt:-1}).limit(1).exec(function(err, image){
        if (err) return res.status(500).end(err);
        if (image.length === 0) return res.json({_id: -1});
        return res.json(image[0]);
    })
})

//getComment
app.get('/api/comments/:imageId/page/:page', function (req, res, next) {
    comments.find({imageId: parseInt(req.params.imageId)}).sort({createdAt:-1}).exec(function(err, comments){
        if (err) return res.status(500).end(err);
        let page = parseInt(req.params.page);
        if (comments.length < (page - 1)*5){
            console.log("here in app.js")
            return res.json([{_id: -1}]);
        }
        else if ((page-1)*5 <= comments.length < (page*5)){
            console.log("second if")
            return res.json(comments.slice(page * 5).reverse());
        }
        else{
            console.log("comment: ");
            console.log(comments);
            return res.json(comments.slice(page * 5, (page + 1) * 5).reverse());
        }
    })
});

app.get('/api/users/', function (req, res, next) {
    users.find({}).sort({createdAt:-1}).limit(5).exec(function(err, users) { 
        if (err) return res.status(500).end(err);
        return res.json(users.reverse());
    });
});

app.get('/api/images/:id/profile/picture/', function (req, res, next) {
    images.findOne({_id: parseInt(req.params.id)}, function(err, image){
        if (!image) res.status(404).end('image # ' + req.params.id + ' does not exists');
        else{
            if (err) return res.status(500).end(err);
            res.setHeader('Content-Type', image.picture.mimetype);
            res.sendFile(image.picture.path, { root: '.' });
        }
    });
});


// Update

app.patch('/api/comments/:id/', function (req, res, next) {
    messages.findOne(({_id: parseInt(req.params.id, 10)}), function(err, message){
        if (err) return res.status(500).end(err);
        if (!message) return res.status(404).end("Message id:" + req.params.id + " does not exists");
        switch (req.body.action){
            case ("upvote"):
                message.upvote+=1;
                break
            case ("downvote"):
                message.downvote+=1;
                break;
        }
        return res.json(message);
    })
});

// Delete

app.delete('/api/images/:id/', function (req, res, next) {
    images.findOne({_id: parseInt(req.params.id, 10)}, function(err, image){
        if (err) return res.status(500).end(err);
        //if (image.length === 0) return res.json({_id: -1});
        images.remove(image, { multi: false }, function(err, num) {  
            return res.json(image);
        });
    });   
});

// deleteComments by imageId
app.delete('/api/images/comments/:imageID/', function (req, res, next){
   // comments.find({imageId: parseInt(req.params.id, 10)}, function(err, comment){
        //if (err) return res.status(500).end(err);
        //if (comment.length === 0) return res.json({_id: -1});
        comments.remove({imageId: parseInt(req.params.imageID)}, { multi: true}, function(err, num) {
            return res.json(num);
        })
    //})
});

// delete comments by commendId
app.delete('/api/comments/:commentId', function (req, res, next){
    comments.remove({_id: parseInt(req.params.commentId)}, { multi: false}, function(err, num){
        return res.json(num);
    })
})

app.use(express.static('static'));
const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});