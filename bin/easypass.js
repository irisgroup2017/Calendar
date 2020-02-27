const puppeteer = require('puppeteer');
const file = require('./conf')
const USERNAME_SELECTOR = 'input[name="email"]';
const PASSWORD_SELECTOR = 'input[name="password"]';
const CTA_SELECTOR = '#btnsubmit';
const con = require('../bin/mysql')

async function startBrowser() {
 const browser = await puppeteer.launch({ headless: true });
 const page = await browser.newPage();
 return {browser, page};
}

async function closeBrowser(browser) {
 return browser.close();
}

async function getContent(url) {
 const {browser, page} = await startBrowser();
 await page.goto(url,{ waitUntil: 'networkidle0' });
 await page.type(USERNAME_SELECTOR,file.username);
 await page.type(PASSWORD_SELECTOR,file.password);
 await page.click(CTA_SELECTOR);
 await page.goto('https://www.thaieasypass.com/en/easypass/smartcard', {waitUntil: 'networkidle0'})
 const trs = await page.$$('tbody tr')
 var json = []
 for (const td of trs) {
  const label = await page.evaluate(el => el.innerText,td)
  const param = label.split("	")
  json.push({
   no: parseInt(param[0]),
   id: param[2],
   smartcard: parseInt(param[3]),
   idcard: param[4],
   amount: param[5],
   lp: param[6],
   update: new Date().getTime()
  })
 };
 saveEasypass(json)
 closeBrowser(browser);
 return "Done";
}

async function saveEasypass(data) {
 for (i=1;i<data.length;i++) {
  const result = await getLicensePlate(data[i])
  const request = await con.q("SELECT * FROM easypass_data WHERE unixid = ?",[result.unixid])
  if (!request.length) {
   await con.q("INSERT INTO easypass_data VALUES (?,?,?)",[result.unixid,data[i].amount,data[i].update])
  } else {
   await con.q("UPDATE easypass_data SET amount = ? , updated = ? WHERE unixid = ?",[data[i].amount,data[i].update,result.unixid])
  }
 }
}
//2กฬ7898กรุงเทพมหานคร
async function getLicensePlate(id) {
 var data = await con.q("SELECT * FROM licenseplate_data WHERE unixid = ?",id.smartcard)
 var query
 if (!data.length) {
  var license="",province,split
  split = id.lp.split(" ")
  for (i=0;i<(split.length-1);i++) {
   license = license +""+ split[i]
  }
  province = split[split.length-1]
  query = "INSERT INTO licenseplate_data VALUES (?,?,?,?,?,?)"
  await con.q(query,[id.id,id.smartcard,license,province,"",""])
  data = [{
   id: id.id,
   unixid: id.smartcard,
   license: license,
   province: province
  }]
 }
 return data[0]
}

async function getEasypass() {
 await getContent("https://www.thaieasypass.com/en/member/login");
}

module.exports.get = getEasypass