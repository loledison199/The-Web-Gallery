# Description

Web API following the REST design principles.  

### Code organization

- `webgallery/app.js`: the main file
- `webgallery/package.json`: the Node.js package file
- `webgallery/static/`:HTML, CSS, Javascript and UI media files
- `webgallery/db/`: the NeDB database files
- `webgallery/uploads/`: the uploaded files

## Specification

Users should be able to:

- add a new image to the gallery by uploading a file 
- retrieve and delete a given image 
- add a comment to a given image
- retrieve comments for a given image (a subset of comment at a time but not all comments at once) 
- delete a given comment
