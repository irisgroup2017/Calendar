function fortuneCookies(data,res) {
	res.cookie('user_name',data.username,{ maxAge: 3600000, httpOnly: true })
	res.cookie('user_dataid',data.dataid,{ maxAge: 3600000, httpOnly: true })
	res.cookie('user_op',data.operator,{ maxAge: 3600000, httpOnly: true })
	res.cookie('user_mail',data.mail,{ maxAge: 3600000, httpOnly: true })
}

function clearCookies(res) {
	res.clearCookie('user_name',{ maxAge: 3600000, httpOnly: true })
	res.clearCookie('user_dataid',{ maxAge: 3600000, httpOnly: true })
	res.clearCookie('user_op',{ maxAge: 3600000, httpOnly: true })
	res.clearCookie('user_mail',{ maxAge: 3600000, httpOnly: true })
}

exports.fortuneCookies = fortuneCookies
exports.clearCookies = clearCookies