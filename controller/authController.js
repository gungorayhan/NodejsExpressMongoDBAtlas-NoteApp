const User=require('../models/User')
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler=require('express-async-handler')



//@desc Login
//@route POST /auth
//@access Public

const login= asyncHandler(async(req,res)=>{

    // öncelikle bilgileri alıyoruz gerçekten bilgi geldimi veri tababınında ilgili kullanıcı var mı kullanıcının şifresi uyuşuyor mu 
    const {username,password} = req.body

    if(!username || !password){
        return res.status(400).json({message:'All fields are required'})
    }

    const foundUser = await User.findOne({username}).exec()

    if(!foundUser || !foundUser.active){
        return res.status(401).json({message:'Unauthorized user yok'})
    }

    const match = await bcrypt.compare(password,foundUser.password) //veri tabanındaki hash lenmiş şifre ile girilen şifrenin karşılaştırması yapılıyor

    if(!match) return res.status(401).json({message:'Unauthorized şifreler eşleşmedi'})

    //burayad kadar gelen veri, veri tababnında kullanıcı ve şifresi kontrolleri yapıldı
    //şimdi token işlemlerine başlayacağız
    //yaptığımız tokenlerın içeriisne sonradan kullanacağımız bilgileri yerleştiriyoruz ve şifrekliyorz
    

    const accessToken=jwt.sign(
        {
            "UserInfo":{
                "username":foundUser.username,
                "roles":foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:'15m'}
    )

    const refreshToken=jwt.sign(
        {"username":foundUser.username},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:'7d'}
    )

    //create secure cookie with refresh token
    res.cookie('jwt',refreshToken,{
        httpOnly:true, //accessible only by web server
        secure:true,//https
        sameSite:'None',//cross-site cookie
        maxAge:7*24*60*60*100 // cookie expiry: set to match rT
    })

    //send accessToken containing username and roles
    //kullanıcıya accessToken ı gönderiyoruz sonrasında Headers içerisinde bize yollayacak 
    //içerisine şifrelediğimiz username ve roles bilgilerini çözerek gerekli yerlerde kullancağız
    //kullanıcı istekte bulunurken token olmaması durumunda api da işlemlerini gerçekleştriremeceyecek 
    console.log(accessToken)
    res.json({accessToken})
    

})



//@desc Refresh
//@route GET /auth/refresh
//@access Public - because access token has expired
const refresh=(req,res)=>{
//giriş yaperken refreshTokenımızı cookies içerisine koymuştuk buradan alıyoruz
//aldığımız değişkenin içerisinde değişkenin içerisinde ki bilgininn varlığı kontrol ediliyor
//var ise değişkene atayarak çözümlüyoruz çözümleme sonucunda hata var mı kontrol ediyoruz 
// refresh tokenımızın içerisinde username vardı onunla veri tabanınndan diğer kullanıcı biliglerini getiriyoruz
// getirdiğimiz bilgileri kullanacarak kullanıcıya yeniden accessToken oluştırmada yardımcı oluyoruz

    const cookies=req.cookies

    if(!cookies?.jwt) return res.status(401).json({message:'Unautorized normal refresh'})

    const refreshToken=cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async(err,decoded)=>{ //callback fonksiyon burada veri tabanıyla iletişe geçileceğinde ayncHandler sonrasında async kullanıyoruz
            if(err) return res.status(403).json({message:'Forbidden'})

            const foundUser=await User.find({username:decoded.username})

            if(!foundUser) return res.status(401).json({message:'Unauthorized refresh'})

            const accessToken=jwt.sign(
                {
                    "UserInfo":{
                        "username":foundUser.username,
                        "roles":foundUser.roles

                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn:'15m'}
            )

            res.json({accessToken})

        })
    )


}


//@desc Logout
//@route POST /auth/logout
//@access Public - just to clear cookie if exists
const logout=(req,res)=>{
    //api tarafında cookie tutmamızdan dolayı burada silmemiz gerekn cookies veridir.
    //client tarafında ise token verisi tutuyoruz. fronetend tarafında çıkış yaperken token verisi sildireceğiz ve çıkışımızı yapmış olacağız
    //veri ile işlem yapmadan önce varlığı kontrol edilir.
    const cookies=req.cookies

    if(!cookies?.jwt) return res.status(204) // no connet
    res.clearCookies('jwt',{httpOnly:true,sameSite:'None',secure:true})
    res.json({message:'Cookies cleared'})

}


module.exports={
    login,
    refresh,
    logout
}