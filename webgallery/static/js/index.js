window.onload = function() {
    "use strict";
    var commentPage = 0;

    function onError(err){
        console.error("[error]", err);
        let error_box = document.querySelector('#error_box');
        error_box.innerHTML = err;
        error_box.style.visibility = "visible";
    };
    
    document.getElementById("add_image_form").addEventListener("submit", function(e) {
        e.preventDefault();
        // read form elements
        var author = document.getElementById("image_author").value;
        var title = document.getElementById("image_title").value;
        var url = document.querySelector('#add_image_form input[name="picture"]').files[0];
        //let picture = document.querySelector('#add_image_form input[name="picture"]').files[0];
        // clean form
        document.getElementById("add_image_form").reset();
        // add message to database
        console.log(url)
        api.addImage(title, author, url, function(err, newImage){
            if (err) return onError(err);
            console.log(newImage);
            image_display_update(newImage);
        });
        commentPage = 0;
    });

    document.getElementById("toggle").addEventListener("click", function(e) {
        var x = document.getElementById("add_image_form");
        if (x.style.display === "none") {
          x.style.display = "flex";
        } else {
          x.style.display = "none";
        }
    });

    function hideImageForm() {
        var x = document.getElementById("add_image_form");
        if (x.style.display === "none") {
          x.style.display = "flex";
        } else {
          x.style.display = "none";
        }
    }

    function image_display_update(image){
        console.log(image);
        var x = document.getElementById("image_gallery");
        x.style.display = "flex";
        document.querySelector('#image_gallery').innerHTML = ``;
        let element = document.createElement('div');
        element.id = "images";
        element.innerHTML = `
        <img class="picture" src="/api/images/${image._id}/profile/picture/"/>
        <div id="image_title">${image.title}</div>
        <div id="image_author">${image.author}</div>
        <div class="image_button">
        <button id="prev" type="click">prev</button>
        <button id="delete" type="click">delete</button>
        <button id="next" type="click">next</button>
        </div>
        `;
        element.querySelector('#prev').addEventListener('click', function(e){
            api.getPrevImage(image._id, function(err, prevImage){
                if (err) return onError(err);
                if (prevImage._id !== -1) {
                    commentPage = 0;
                    image_display_update(prevImage);
                    comment_display_update(commentPage, prevImage._id);
                }
            });            
        });
            
        element.querySelector('#next').addEventListener('click', function(e){
            api.getNextImage(image._id, function(err, nextImage){
                if (err) return onError(err);
                console.log(JSON.stringify(image));
                if (nextImage._id !== -1) {
                    commentPage = 0;
                    image_display_update(nextImage);
                    comment_display_update(commentPage, nextImage._id);
                }
            });    
        });
        element.querySelector('#delete').addEventListener("click", function(e) {
            api.check_image(image._id, function(display){
                console.log(display);
                api.deleteImage(image._id, function(err, deletedImage){
                    if (err) return onError(err);
                    api.deleteImageComments(deletedImage._id, function(err, num){
                        if (err) return onError(err);
                    });
                    if (display._id !== -1){
                        commentPage = 0;
                        image_display_update(display);
                        comment_display_update(commentPage, display._id);
                    }else{
                        document.querySelector('#image_gallery').innerHTML = '';
                        document.querySelector('#comment_form').innerHTML = '';
                        document.querySelector('#comments').innerHTML = '';
                        commentPage = 0;
                        document.getElementById("image_gallery").style.display = "none";
                        document.getElementById("comment_form").style.display = "none";
                        document.getElementById("comments").style.display = "none";
                        hideImageForm();
                    }
                })
            });
        });
               
        document.querySelector('#image_gallery').prepend(element);
        comment_form_update(image._id);

        //api.getComments(image._id, commentPage, function(err, comments){
        //    console.log(comments);
         //   if (comments.length !== 0){
         //       comment_display_update(commentPage, image._id);
        //    }
         //   else{
        //        document.querySelector("#comments").innerHTML = ``;
         //   }
        //})
    }

    function comment_form_update(imageId){
        var x = document.getElementById("comment_form");
        x.style.display = "flex";
        document.querySelector('#comment_form').innerHTML = `
        <form id="comment-form-frame">
            <input type="text" id="comment_author" class="form_element" placeholder="Enter your name" name="author_name" maxlength="255" required/>
            <input type="text" id="comment_content" class="form_element" placeholder="Enter your comment" name="comment_content" maxlength="255" required/>
            <button id="submit_comment" type="submit">post</button>
        </form>
        <div id="comment_button">
        <button id="prev_page" type="click">previous page</button>
        <button id="next_page" type="click">next page</button>
        </div>
        `;

        document.querySelector('#comment-form-frame').addEventListener('submit', function(e){
            e.preventDefault();
            var author = document.getElementById("comment_author").value;
            var content = document.getElementById("comment_content").value;
            document.querySelector("#comment-form-frame").reset();
            api.addComment(imageId, author, content, function(err, comment){
                comment_display_update(commentPage, imageId);
            });
        });
        
        document.querySelector('#prev_page').addEventListener('click', function(e){
            api.getComments(imageId, commentPage-1, function(err, comments){
                if (comments.length !== 0) {
                    commentPage--;
                    comment_display_update(commentPage, imageId);
                }
            });
        });

        document.querySelector('#next_page').addEventListener('click', function(e){
            api.getComments(imageId, commentPage+1, function(err, comments){
                if (comments.length !== 0) {
                    commentPage++;
                    comment_display_update(commentPage, imageId);
                }
            });
        });
    }


    function comment_display_update(commentPage, imageId) {
        var x = document.getElementById("comments");
        x.style.display = "flex";
        api.getComments(imageId, commentPage, function(err, comments){
            if (err) return onError(err);
            console.log("comments");
            console.log(comments);
            document.querySelector('#comments').innerHTML = '';
            if (comments.length !== 0) {
                comments.forEach(function(comment){
                    let element = document.createElement('div');
                    element.className = "comment";
                    element.innerHTML = `
                    <div class="comment_property">
                    <div class="author_name">${comment.author}</div>
                    <div class="comment_date">${comment.createdAt}</div>
                    </div>
                    <div class="comment_content">${comment.content}</div>
                    <button type="click" id="comment_delete">delete</button>
                    `;
                    element.querySelector('#comment_delete').addEventListener('click', function(e){
                        api.deleteComment(comment._id, function(err, num){
                            if (err) return onError(err);
                        });
                        api.getComments(imageId, commentPage, function(err, comments){
                            if (comments._id === -1){
                                commentPage--;
                            }
                            hideImageForm();
                            comment_display_update(commentPage, imageId);
                        });
                        //hideImageForm();
                        //comment_display_update(commentPage, imageId);
                    });
                
                    document.querySelector('#comments').prepend(element);
                });
            }else{
                document.querySelector("#comments").innerHTML = ``;
            }
        });
    }

    api.hasImage(function(err, img){
        console.log(img._id);
        console.log("in hasImage");
        if (img._id !== -1) {
            image_display_update(img);
            comment_display_update(commentPage, img._id);
        }
    });
};