const jwt = require('jsonwebtoken')

// burada kullanıcıdan gelen token ve header verilerini kullanacağız
//verilerinin doğruluğunun kontrolü sonrasındda gerekli işlemleri yapağız
const verifyJWT = (req,res,next)=>{
    
    const authHeader = req.headers.authorization || req.headers.Authorization
    
    if(!authHeader?.startsWith('Bearer ')){
        return res.status(401).json({message:'Unauthorized token'})
    }

    //bearer token olduğunu onayladık şimdi tokenımıza ulaşıyoruz.token erişimi sonrasında içerisindeki bilgilerede ulaşabileceğiz
    const token=authHeader.split(' ')[1]

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err,decoded)=>{
            if(err) return res.status(403).json({message:'Forbidden status 403'})
            req.user=decoded.UserInfo.username
            req.roles=decoded.UserInfo.roles
            next()
        }
    )

}

module.exports=verifyJWT