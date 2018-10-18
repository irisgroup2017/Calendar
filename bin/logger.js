var log4js = require('log4js')
log4js.configure({
	appenders: {
        everything: { 
            type: 'dateFile', 
            filename: 'logs/logs.log', 
            pattern: '.yyyy-MM-dd', 
            compress: false , 
            layout: { 
              type: 'pattern',
              pattern: '%d %p %c %m%n'
            } 
        }
	},
	categories: {
	    default: { 
          appenders: [ 'everything' ], 
          level: 'debug'
        },
        info: { 
            appenders: [ 'everything' ], 
            level: 'info'
        },
        warning: { 
            appenders: [ 'everything' ], 
            level: 'warning'
        },
        notice: { 
            appenders: [ 'everything' ], 
            level: 'notice'
        }
	}
})