// const {format}=require('date-fns') //tarih

// const {v4:uuid}=require('uuid') //spesifik bir id vermede kullanacağız   ve güvenlik için kullanılır

// const fs=require('fs')
// const fsPromises=require('fs').promises //dosya oluşturma yazma işlmelerinde kullanacağız

// const path=('path')

// const logEvents=async(message,logFileName)=>{//seçenekli ve bir çok yerde kullanalabilir ayrıştırılmış bir fonksiyon yazıyoruz
//     const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`
//     const logItem = `${dateTime}\t${uuid()}\t${message}\n`
//     try {
//         if(!fs.existsSync(path.join(__dirname,'..','logs'))){ //eğer logs klasörü yok ise oluştur 
//             await fsPromises.mkdir(path.join(__dirname,'..','logs'))
//         }
        
//        await fsPromises.appendFile(path.join(__dirname,'..','logs',logFileName), logItem)
//     }catch(err){
//         console.log(err)
//     }
// }

// const logger=(req,res,next)=>{//yazdığımız ayrıştırılmış fonksiyonu middleware olarak yazdığımız fonksiyon içerinden kullanıyoruz
//     logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`,'reqLog.log')
//     console.log(`${req.method} ${req.path}`)
//     next()
// }

// //server.js de çağıracağımız için her iki yazdığımız fonskyonuda export ediyoruz
// module.exports={logEvents,logger}
const { format } = require('date-fns')
const { v4: uuid } = require('uuid')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss')
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
    } catch (err) {
        console.log(err)
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
    console.log(`${req.method} ${req.path}`)
    next()
}

module.exports = { logEvents, logger }