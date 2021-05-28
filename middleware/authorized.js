function authUser(req,res,next) {
 if (!req.cookies.user_dataid) {
  res.redirect('/');
 }
 next()
}

module.exports = { 
 authUser
}