function fortuneCookies(data,res) {
	res.cookie('user_name',data.username,{ maxAge: 4 * 60 * 60 * 1000, httpOnly: true })
	res.cookie('user_dataid',data.dataid,{ maxAge: 4 * 60 * 60 * 1000, httpOnly: true })
	res.cookie('user_op',data.operator,{ maxAge: 4 * 60 * 60 * 1000, httpOnly: true })
	res.cookie('user_mail',data.mail,{ maxAge: 4 * 60 * 60 * 1000, httpOnly: true })
}

function clearCookies(res) {
	res.clearCookie('user_name')
	res.clearCookie('user_dataid')
	res.clearCookie('user_op')
	res.clearCookie('user_mail')
}

exports.fortuneCookies = fortuneCookies
exports.clearCookies = clearCookies