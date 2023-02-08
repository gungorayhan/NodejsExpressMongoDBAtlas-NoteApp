const express=require('express')
const router=express.Router();

//import apicache from "apicache" // api gelen isteklerimizi cache lerimizi alıyoruz. gelen kullanıcılar eğer daha önce sorgu çalıştırılmış 
// ve veriler getirilmiş ise tekrar gelerek buradan verilerini alıyor. cache süre dolmuş ise kullanıcı sorgudan verilerini alıyor cache belleğe aktarıyor



const userConstroller=require('../controller/usersController')

const verifyJWT=require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .get(userConstroller.getAllUsers)
    .post(userConstroller.createNewUser)
    .patch(userConstroller.updateUser)
    .delete(userConstroller.deleteUser)

module.exports=router



// let cache = apicache.middleware

// app.use(cache('5 minutes'))

// app.get('/will-be-cached', (req, res) => {
//   res.json({ success: true })
// })