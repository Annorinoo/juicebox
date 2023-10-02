# Block 34 - Juicebox

## Introduction

In this assessment, you'll be provided this GitHub repo with details for a full operational CRUD API that uses Express.JS, PostgreSQL, and other technologies that you've been trained on. 

## Problems to Solve

Begin this Career Simulation by cloning the GitHub repo, installing dependencies, providing environmental variables to connect your database, and running the server. From here, you'll encounter four problems that you'll need to solve. See problems below:

### Problem 1: Repair Database Schema

We'll need to seed our database with some data. The database schema is currently broken, so we'll need to fix it. Go to `db/index.js` and fix the `createUser()` function.

Solution:
```
// Correction on line 22: VALUES($1, $2, $3) -> VALUES($1, $2, $3, $4). There are four parameters so there should be four placeholders
async function createUser({ 
  username, 
  password,
  name,
  location
}) {
  try {
    const { rows: [ user ] } = await client.query(`
      INSERT INTO users(username, password, name) 
      VALUES($1, $2, $3, $4) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `, [username, password, name, location]);

    return user;
  } catch (error) {
    throw error;
  }
} 
```
### Problem 2: Create a Middleware Function

The function `requireUser` is missing it's code. We need it to check if a user is logged in, and if so, attach the user to the request object. Navigate to `api/utils.js` and write the middleware function.

Soluttion: 
```
function requireUser(req, res, next) {
  //request, response, and next (function that passes contorl to the next middleware or route handler)
  if (req.user) {
    // req.user = request user. used to store information about the currently authenticated user. 
    // when you see req.user it referes to the current authenticated user associated with the incoming HTTP request. 
    next();
  } else {
    // Display error if not logged in
    res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be logged in'
    });
  }
} 
```

### Problem 3: Repair an API Endpoint

Your endpoint to create new Posts is not able to handle "tags" properly. Navigate to `api/posts.js` and find the POST method using the `postsRouter` controller function. Edit it to handle the many "tags" that may be applied to a post.

Solution: 
```
postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content = "", tags } = req.body; //Destructuring assignments to extract `title`, `content` `and tags` property from req.body
  //req.body contains the data sent in the request body when creating a new post (POST)
  //content "" - this is a default value for `content`. If it is not provided in the reqeust, it will default to an empty string

  const postData = {};
  //postData = object storing data for creating a new post

  try {
    postData.authorId = req.user.id;
    postData.title = title;
    postData.content = content;
    // Assigns values to properties in the `postData` object
    // postData.authorId = asigned `id` of the user (`req.user.id`) assiciated with the post of the user who created it
    // postData.title = `title` extracted from request body 
    // postData.content = `content` extracted from request body

    if (tags && tags.length > 0) {
      // checking for tags and has a length more than 0

      postData.tags = tags.trim().split(/\s+/);
      // if tags exist and is not an empty, split them into an array (using `split` method).
      // (`/\s+/`) to split them by whitespace.
    }

    const post = await createPost(postData);
    // create new post by calling `createPost` function with `postData` object as an argument.
    // async function to interact with database to store the post data

    if (post) {
    //checks if post exists
      res.send(post);
      //If it does exist, it sends the created post as a response using `res.send(post)`
    } else {
      //if there is an error, it will display an error message.
      next({
        name: 'PostCreationError',
        message: 'There was an error creating your post. Please try again.'
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});
```

### Problem 4: Create a New API Endpoint

The DELETE route for posts is currently "under construction". Navigate to `api/posts.js` and find the DELETE method using the `postsRouter` controller function. Write the code to delete a post.

Solution: 
```
postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const postToDelete = await getPostById(postId);
    if(!postToDelete) {
      next({
        name: 'Not found',
        message: `No post by ID ${postId}`
      }) ;
    } 

    if (originalPost.author.id === req.user.id) {
      // If the authenticated user is the author of the post, delete it
      await deletePost(postId);
      res.send({ message: 'Post deleted successfully' });
    } else {
      // If the authenticated user is not the author, they cannot delete the post
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot delete a post that is not yours'
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});
```

### STRETCH GOAL: Create a Route to Serve Frontend Web App

All of our work so far has been in the API layer and on the database! We need to create a frontend application using HTML, CSS, and JavaScript or `npx create-react-app` to be served by our API. Navigate to `client/index.html` and create a frontend application that can represent our application. 
