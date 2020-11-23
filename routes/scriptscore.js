exports.cookies = (x) => { return { user: x.user_name,dataid: x.user_dataid,operator: x.user_op,mail: x.user_mail } }
exports.objunion = (x,y) => { return {...x,...y} }
exports.persist = (a,b,c) => {
 return c.map(d => {
  if (d == null) {
   return false
  } else if (typeof d == 'number') {
   return (d == a || d == b)
  } else {
   let e = d.split(',')
   return e.map(f => {
    return (parseInt(f) == a || parseInt(f) == b)
   })
  }
  return false
 },[]).flat(1).filter(g => g).join()
}

exports.relation = (contact,depart) => {
 console.log(this)
 return this.map(content => {
  let checkKey = ['memo_from','memo_to','memo_cc','memo_admin','memo_boss','memo_approver']
  return Object.keys(content).reduce((acc,it) => {
  let obj = content[it],info
  if (checkKey.indexOf(it) > -1) {
   if (obj == null) {
    info = null
   } else if (typeof obj == 'number') {
    info = (contact[obj] != undefined ? contact[obj].name : depart[obj].depart)
    if (checkKey.indexOf(it) > 2) {
     acc[it+'d'] = contact[obj].job
    }
   }
   else {
    let users = obj.split(',')
    info = users.map(user => (contact[user] != undefined ? contact[user].name : depart[user].depart),[])
   }
   acc[it] = info
  } else {
   acc[it] = obj
  }
  return acc
  },{})
 })
}
