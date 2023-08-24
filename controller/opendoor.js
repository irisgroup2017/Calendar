const { exec } = require('child_process');
const { logger } = require('../bin/logger')

const process = (req,res) => {
    let user = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let host = req.socket.localAddress;
    let backUrl = req.header('Referer') || '/';
    let sameAddr = (ipformat(user) == ipformat(host) ? true : false);
    logger('info',`${req.cookies.user_name} requested unlock office door`)
    if (sameAddr) {
        logger('info',`${req.cookies.user_name} unlocked office door`)
        exec('node D:\\unlockdoor\\zk.js',(error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
    }
    res.redirect(backUrl)
}

let ipformat = (ip) => {
    ip = ip.split(':').pop();
    ip = ip.split('.');
    ip.pop();
    return ip.join('.');
}

module.exports = {
    process
}

