function fortuneCookies(data,res) {
	res.cookie('user_name',data.username,{ maxAge: 4 * 60 * 60 * 1000, httpOnly: true })
	res.cookie('user_dataid',data.dataid,{ maxAge: 4 * 60 * 60 * 1000, httpOnly: true })
	res.cookie('user_op',data.operator,{ maxAge: 4 * 60 * 60 * 1000, httpOnly: true })
	res.cookie('user_mail',data.mail,{ maxAge: 4 * 60 * 60 * 1000, httpOnly: true })
}

function refreshCookies(req,res,next) {
	if (!req.cookies.user_dataid) {
		res.redirect('/login')
	} else {
		res.cookie('user_name',req.cookies.user_name,{ maxAge: 4 * 60 * 60 * 1000, httpOnly: true })
		res.cookie('user_dataid',req.cookies.user_dataid,{ maxAge: 4 * 60 * 60 * 1000, httpOnly: true })
		res.cookie('user_op',req.cookies.user_op,{ maxAge: 4 * 60 * 60 * 1000, httpOnly: true })
		res.cookie('user_mail',req.cookies.user_mail,{ maxAge: 4 * 60 * 60 * 1000, httpOnly: true })
		next()
	}
}

function clearCookies(res) {
	res.clearCookie('user_name')
	res.clearCookie('user_dataid')
	res.clearCookie('user_op')
	res.clearCookie('user_mail')
}


exports.refreshCookies = refreshCookies
exports.fortuneCookies = fortuneCookies
exports.clearCookies = clearCookies