const rateLimit= require('express-rate-limit')

const {logEvents} = require('./logger')

const loginLimiter=rateLimit({
    windowMs:60*1000, //1 minute
    max:5,//limit each IP to 5 login requests per 'window' per minute 
    message:
    {
        message:'To many login attemts from this Ip, please try again after a 60 second pause'},
        handler:(req,res,next,options)=>{
            logEvents(`Too Many Request: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,'errLog.log')
            res.status(options.statusCode).send(options.message)
        },
        standardHeaders:true,//Return rate limit info in the 'RateLimit-*' headers
        legacyHeaders:false,//Disable the 'X-RareLimit-*' headers
})

module.exports=loginLimiter