const express = require('express')
const router=express.Router()

const authController=require('../controller/authController')

// yazdığımız limiter middleware nı burada kullanacğız
const loginLimiter=require('../middleware/loginLimiter')



router.route('/')
    .post(authController.login)

router.route('/refresh')
    .get(authController.refresh)

router.route('/logout')
    .post(authController.logout)


module.exports=router