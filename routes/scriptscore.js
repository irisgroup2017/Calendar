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