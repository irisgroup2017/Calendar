exports.cookies = (x) => { return { user: x.user_name,dataid: x.user_dataid,operator: x.user_op,mail: x.user_mail } }
exports.objunion = (x,y) => { return {...x,...y} }