require('dotenv').config()
//require('express-async-errors')
const express = require("express")
const app= express()
const path=require('path')
const {logger,logEvents}=require('./middleware/logger') //middleware olarak yazdığımız fonksiyonu burada çağırıyoruz
const errorHandler=require('./middleware/errorHandler')
const cookieParser=require('cookie-parser')
const cors=require('cors')
const corsOptions=require('./config/corsOptions')
const connectDB=require('./config/db')
const mongoose=require('mongoose')

const PORT = process.env.PORT || 3500

//console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)// gelen istekleri logluyoruz

app.use(cors(corsOptions)) //başka sitelerden gelen istekleri negelliyoruz. sadece izin verilen siteler

app.use(express.json()) //gelen verileri json çevirir

app.use(cookieParser())

app.use('/',express.static(path.join(__dirname,'public')))

app.use('/',require('./routes/root')) //yönlendirmeler yapılacak
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/notes', require('./routes/noteRoutes'))

app.all('*',(req,res)=>{ // gelen isteklerin hatalı olması durumunda html saysımı yoksa json sayfasımı durumlarına göre geri dönüşler ayarlanıyor
    res.status(404)
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname,'views','404.html'))
    }else if(req.accepts('json')){
        res.json({message:"404 NOT FOUND"})
    }else{
        res.type('txt').send('404 NOT FOUND')
    }
})

app.use(errorHandler)
mongoose.connection.once('open',()=>{
    console.log('Connect to MongoDB')
    
app.listen(PORT,()=>{console.log(`server runnning on port ${PORT}`)})
})

mongoose.connection.on('error',err=>{
    console.log(err)
    logEvents(`${err.no}:${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrLog.log')
})