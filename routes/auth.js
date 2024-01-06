const express = require('express');
const User = require('../model/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser')

const JWT_SECRET = "shhhSecreet"

//Router1:Create user using : Post "/api/auth/createuser" No reqired

router.post('/createuser',[
    body('email','Enter a Valid Email ').isEmail(),
    body('name', 'Enter correct name').isLength({min:3}),
    body('password','Minimum Length of pass is 5').isLength({min:5}),
],async (req,res)=>{
    let success = false;
    const errors = validationResult(req);
   
   if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
   }
   //Check user alredy exist wit this email
   try {
    
   
   let user = await User.findOne({email: req.body.email})
   if(user){
    return res.status(400).json({success,errors: "sorry user with is email is alredy exist"});
   }
   const salt = await bcrypt.genSalt(10);
   const secPass = await bcrypt.hash(req.body.password, salt)
   user = await User.create({
    name: req.body.name,    
    email: req.body.email,    
    password: secPass,  
    
   })
// .then(user => res.json(user))
//    .catch(err=> {console.log(err);
// res.json({error: 'Please enter a unique value',message:err.message})})
const data = {
    user:{
        id: user.id
    }
}
const authToken = jwt.sign(data, JWT_SECRET);
success = true;
res.json({success,authToken})
} catch (error) {
    console.log(error.message)
    res.status(500).send("Internal server error");
}
})

//ROUTE 2: Aunthenticate a user using : Post "/api/auth/login" No login reqired
router.post('/login',[
    body('email','Enter a Valid Email ').isEmail(),
   
    body('password','Password cannot be blank').exists(),
],async (req,res)=>{
    let success = false;
    //If thereare errors,return Bad request and the error
    const errors = validationResult(req);

   if(!errors.isEmpty()){
    return res.status(400).json({error:errors.array()});
   }

const {email,password} = req.body;
try {
    let user = await User.findOne({email})
    if (!user) {
        success = false;
       return res.status(400).json({success,error:'Enter correct credential'})
    }
    const passwordCompare = await bcrypt.compare(password,user.password)
    if(!passwordCompare){
        success = false;
        return res.status(400).json({success,error:'Enter correct credential'})
    }
    const data = {
        user:{
            id: user.id
        }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({success,authToken})
} catch (error) {
    console.log(error.message)
    res.status(500).send("Internal server error");
}
});

//ROUTE 3: Get lo using : Post "/api/auth/getuser" No login reqired
router.post('/getuser',fetchUser,async (req,res)=>{
    const errors = validationResult(req);
try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
} catch (error) {
    console.log(error.message)
    res.status(500).send("Internal server error");
}
});
    
 
module.exports = router