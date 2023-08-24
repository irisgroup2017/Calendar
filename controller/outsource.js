const ADODB = require('node-adodb');
const moment = require('moment');
const log = require('../bin/logger');

const indexView = (req,res,next) => {
    res.render('outsourcetime',req.body);
}

const singleSearch = async (req,res) => {
    const DB = new TigerDatabase(req.body);
    const data = await DB.getTime();
    //log.logger("info",``);
    res.json(data);
}

class TigerDatabase {
  constructor(data) {
    this.id = data.id || null;
    this.start = data.stime || moment("2000/01/01","YYYY/MM/DD");
    this.end = data.etime || moment().add(1,'d').format("YYYY/MM/DD");
    this.scanDb = process.env.DB_SCAN;
    this.mdb = ADODB.open(this.scanDb,false);
  }

  async getTime() {
    const timelist = await this.mdb
      .query(
        `SELECT p.PersonCardID,p.FnameT,p.LnameT,t.PersonCardID,t.TimeInout FROM FCT_Person p LEFT JOIN FCT_TimeFinger t ON p.PersonCardID = t.PersonCardID WHERE t.PersonCardID = '${this.id}' AND t.TimeInout >= #${this.start}# AND t.TimeInOut <= #${this.end}# ORDER BY t.TimeInout ASC`
      )
      .then((result) => {
        return this.formatData(result);
      })
      .catch((e) => {
        return e;
      });
    return timelist;
  }

  formatData(data) {
    if (!data.length) return null;
    return {
        id: this.id,
        datestart: this.start,
        dateend: moment(this.end,'YYYY/MM/DD').subtract(1,'d').format('YYYY/MM/DD'),
        fullname: `${data[0].FnameT} ${data[0].LnameT}`,
        source: data,
        timelist: data.reduce((acc,cur,idx,arr) => {
            let date = moment(cur.TimeInout,moment.ISO_8601).format("DD/MM/YYYY");
            let time = moment(cur.TimeInout,moment.ISO_8601).format("HH:mm");
            let lastDate = (idx ? moment(arr[idx-1].TimeInout,moment.ISO_8601).format("DD/MM/YYYY") : "");
            if (date==lastDate) { acc[date].push(time); return acc; }
            acc[date]=[time];
            return acc;
        },{})
    }
  }
}

module.exports = {
    indexView,
    singleSearch
}