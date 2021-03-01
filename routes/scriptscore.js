module.exports = {
 cookies: function(array) {
  return { user: array.user_name,dataid: array.user_dataid,operator: array.user_op,mail: array.user_mail }
 },
 objUnion: function(x,y) {
  return {...x,...y}
 },
 classAssign: function(arr,id) {
  let approve = "return approve reject"
  let edit = "edit"
  let del = "delete"
  let cancel = "cancel"
  if (arr.length) {
   let objs = arr.map(item => {
    let status = item.memo_status
    switch (status) {
     case 0:
      item.setClass = cancel
      return item
     case 1:
      if (item.memo_boss == id) {
       item.setClass = approve
       return item
      } else if (item.memo_admin == id) {
       item.setClass = del
       return item
      } else {
       return item
      }
     case 2:
      if (item.memo_admin == id) {
       item.setClass = edit
       return item
      } else {
       return item
      }
     case 3:
      if (item.memo_approver == id) {
       item.setClass = approve
       return item
      } else {
       return item
      }
     case 4:
      if (item.memo_admin == id) {
       item.setClass = edit
       return item
      } else {
       return item
      }
     default:
      item.setClass = ""
      return item
    }
   })
   return objs
  } else {
   return arr
  }
 },
 persist: function(a,b,c) {
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
  },[]).flat(1).filter(g => g).join()
 },
 relation: function(objs,contact,depart) {
  return objs.map(content => {
   let checkKey = ['memo_from','memo_to','memo_cc','memo_admin','memo_boss','memo_approver']
   return Object.keys(content).reduce((acc,it) => {
   let obj = content[it],info
   if (checkKey.indexOf(it) > -1 && obj != 0) {
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
}