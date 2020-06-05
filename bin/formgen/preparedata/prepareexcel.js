function fmhr0102(data) {
 let info = {}
 let dat = data.data
 let ex = {}
 let item = ["reg-pos","reg-bud","reg-jan","reg-feb","reg-mar","reg-apr","reg-may","reg-jun","reg-jul","reg-aug","reg-sep","reg-oct","reg-nov","reg-dec","reg-cur","reg-rep","reg-inc","reg-tot"]
 dat.forEach(e => {
   let i=0
   ex[i] = []
   for (var k in e) {
    ex[i].push((i==1 ? finform(e[k]) : e[k]))
   }
   i++
 })
 info.data = ["formid",data.depart,data.bdyear]
 info.loop = ex
 return info
}

function finform(n) {
 n=n.replace(/[,|e]/g,"")
 return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

exports.fmhr0102 = fmhr0102