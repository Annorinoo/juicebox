const express = require('express');
const postsRouter = express.Router();

const { requireUser } = require('./utils');

const { 
  createPost,
  getAllPosts,
  updatePost,
  getPostById,
} = require('../db');

postsRouter.get('/', async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter(post => {
      // the post is active, doesn't matter who it belongs to
      if (post.active) {
        return true;
      }
    
      // the post is not active, but it belogs to the current user
      if (req.user && post.author.id === req.user.id) {
        return true;
      }
    
      // none of the above are true
      return false;
    });
  
    res.send({
      posts
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

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

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost })
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  res.send({ message: 'under construction' });
});

module.exports = postsRouter;