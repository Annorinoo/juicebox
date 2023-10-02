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

module.exports = {
  requireUser
}