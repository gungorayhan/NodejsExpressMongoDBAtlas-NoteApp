const User=require('../models/User')
const Note=require('../models/Note')

const asyncHandler=require('express-async-handler')
const bcrypt=require('bcrypt')

//----------------------
//@desc get all users
//route get users
//@access private

const getAllUsers=asyncHandler(async(req,res)=>{

    const users=await User.find().select('-password').lean() //kullanıcıların hepsi arıyoruz şifrelerini seçim dışı bırakıyoruz

    if(!users?.length){
        return res.status(400).json({message:'No users found'})
    }
    res.json(users)
})

//-------------------------
//@desc create all users
//route post users
//@access private
//lean() ile mongoose belgelerini javascript belgelerine çeviriyoruz
//exec() Bir eşleşme bulursa bir sonuç dizisi döndürür, aksi takdirde null döndürür.
const createNewUser=asyncHandler(async(req,res)=>{
    const {username,password,roles}=req.body;

    //confirm data
    if(!username || !password){
        return res.status(400).json({message:'All fields ara required'})
    }

    //check for duplicate

    const duplicate= await User.findOne({username}).collation({locale:
        'en', strength:2}).lean().exec() //önce ver,y, mongoDb den mongoose ile buluyoruz. veri mongoose dosyası olarak geliyor
    //sonrasında lean() ile javascript objesine çeviriyruz. exec() ile eğer bir veri varsa döndürüyoruz. Gelen bir veri yoksa ise null döndürüyoruz
    if(duplicate){
        return res.status(400).json({message:'Duplicate user name'})
    }

    //hash password
    const hashedPwd=await bcrypt.hash(password,10) //salt rounds

    //const userObject={username,"password":hashedPwd,roles}

    const userObject=(!Array.isArray(roles) || !roles.length) // varsayılan role döndürdüğümüzden dolayı rol boş gelirse var sayılan eğer gelmez ise kullanıcın seçtiği rol atanır
    ?{username,"password":hashedPwd}
    :{username,"password":hashedPwd,roles}

    //create and store new user

    const user = await User.create(userObject)
    if(user)//created
    {
        res.status(201).json({messsage:`New user ${username} created`})
    }
    else{
        res.status(400).json({message:'Invalid user data received'})
    }

})

//------------------------
//@desc update all users
//route patch users
//@access private

const updateUser=asyncHandler(async(req,res)=>{
    const {id, username,roles,active,password} = req.body

    //confirm data
    if(!id || ! username || !Array.isArray(roles) || !roles.length || typeof active !=='boolean'){
        res.status(400).json({message:'All fields are required'})
    }

    // öncelikle güncellenecek user gerçekten var mı 
    const user = await User.findById(id).exec() 
    if(!user){
        return res.status(400).json({message:'User not found'})
    }

    //check for duplicate
    // var ise bir duplicate var mı 
    const duplicate = await User.findOne({username}).collation({locale:
    'en',strength:2}).lean().exec()
    //allow updates to the original
    if(duplicate && duplicate?._id !== id){
        res.status(401).json({message:'Duplicate  username'})
    }

    // daha önce cektiğimiz veriyi değiştiriyoruz ve tekrar kayıt ediyoruz
    user.username=username;
    user.roles=roles;
    user.active=active;

    if(password){//password kontrolünden sonra gelen password tekrar hash edilerek kayır ediliyor
        //hash password
        user.password=await bcrypt.hash(password,10) //salt rounds
    }

    const updatedUser= await user.save(); // değiştirdiğimiz user verisi tekrar kayıt ediyoruz. veri tabanında kayıt  güncellemesi başarıyla gerçekleşti

    res.jason({message:`${updateUser.username} update`})
})

//---------------------------
//@desc delete all users
//route patch users
//@access private

const deleteUser=asyncHandler(async(req,res)=>{
    const {id} = req.body

    if(!id){ // gelen verinin kontrolü yapılıyor
        return res.status(400).json({message:'User ID Required'})
    }

    const note=await Note.findOne({user:id}).collation({locale:
    'en',strength:2}).lean().exec() // note modül kullanılarak kişinin kaydettiği notlar var mı kontrol ediliyor

    if(note){
        return res.status(400).json({message:'User has assigned notes'})
    }

    const user =await User.findById(id).exec() //id ile 

    if(!user){
        return res.status(400).json({message:'User not found'})
    }
    const result = await user.deleteOne()

    const reply =`UserName ${result.username} with ID${result._id} delete`
    res.json(reply)
})

module.exports={
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}