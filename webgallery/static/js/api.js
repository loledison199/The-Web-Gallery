var api = (function(){
    "use strict";

    var module = {};

    function send(method, url, data, callback){
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    function sendFiles(method, url, data, callback){
        let formdata = new FormData();
        Object.keys(data).forEach(function(key){
            let value = data[key];
            formdata.append(key, value);
        });
        let xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        xhr.send(formdata);
    }
   
    

    /*  ******* Data types *******
        image objects must have at least the following attributes:
            - (String) _id 
            - (String) title
            - (String) author
            - (Date) date
    
        comment objects must have the following attributes
            - (String) _id
            - (String) imageId
            - (String) author
            - (String) content
            - (Date) date
    
    ****************************** */ 
    
    // add an image to the gallery
    module.addImage = function(title, author, file, callback){
        sendFiles("POST", "/api/images/", {title: title, author: author, picture: file}, callback);
    };
    // hasImage
    module.hasImage = function(callback){
        send("GET", "/api/images/hasimage/", null, callback);
    }
    
    // getPrevImage
    module.getPrevImage = function(imageId, callback){
        send("GET", "/api/images/previmage/" + imageId, null, callback);

    }

    // getPrevImage
    module.getNextImage = function(imageId, callback){
        send("GET", "/api/images/nextimage/" + imageId, null, callback);

    }
    
    // delete an image from the gallery given its imageId
    module.deleteImage = function(imageId, callback){
        send("DELETE", "/api/images/" + imageId, null, callback);
    }
    
    // delete individual comment
    module.deleteComment = function(commentId, callback){
        send("DELETE", "/api/comments/" + commentId, null, callback);
    }
    
    // delete comments associated with an image by imageId
    module.deleteImageComments = function(imageId, callback){
        send("DELETE", "/api/images/comments/" + imageId, null, callback);
    }

    module.check_image = function(imageId, callback){
        api.getPrevImage(imageId, function(err, preimage){
            console.log(preimage);
            if (preimage._id === -1){
                console.log("im here");
                api.getNextImage(imageId, function(err, nextimage){
                    console.log(nextimage);
                    if (nextimage._id === -1){
                        return callback(nextimage);
                    }
                })
            }else{
                return callback(preimage);
            }
        });
    }
    
    // add a comment to an image
    module.addComment = function(imageId, author, content, callback){
        send("POST", "/api/comments/", {content: content, author: author, imageId: imageId}, callback);
    }
    
    // delete a comment to an image
    module.deleteComment = function(commentId, callback){
        send("DELETE", "/api/comments/" + commentId, null, callback);
    }

    module.getComments = function(ImageId, page, callback){
        send("GET", "/api/comments/" + ImageId + "/page/" + page, null , callback);
    }
    
    return module;
})();