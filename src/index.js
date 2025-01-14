require('dotenv').config();
const express=require('express');
const app=express();
const port=process.env.PORT||5000;
const B=require('./db/conn.js')
const Student =require('./models/students.js')
app.use(express.json())
app.use(express.urlencoded({extended:false}))
//!Backend express
const cookieParser=require("cookie-parser");
app.use(cookieParser())
const KEY = process.env.KEY;
console.log('Secret Key:',KEY);
console.log(`this is secret key ${process.env.KEY}`)
const auth= require("./middleware/auth.js")
const bcrypt=require("bcryptjs");
const token=require("jsonwebtoken");



//!Frontedn express
//!-- Static path and view path
const hbs=require('hbs');
const path=require('path');
const { Cookie } = require('express-session');
const static_path = path.join(__dirname, '../public/');
app.use(express.static(static_path));
console.log(static_path)
// ToDo   views folder path
const temp_path =path.join(__dirname, '../Template/views');
// const temppath =path.join(__dirname, '../Template/views/index ');
// app.set('views', temppath)
app.set('view engine', 'hbs');
app.set('views', temp_path);
//??   hbs partials folder path
const hbs_path =path.join(__dirname, '../Template/partials');
hbs.registerPartials(hbs_path);


//!---------------------------------------------------------------------------------------------APi & Pages Start 
  
//?Routing
app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/login',(req,res)=>{
        res.render('login')
    })

app.get('/register',auth,(req,res)=>{
    res.render('register')
})



app.get('/read', auth, (req, res) => {
    const password=req.body.firstname;
    const z =JSON.password;


    res.render('read', {z});
});



// !====API CREATION

app.get('/logout',auth , async(req,res)=>{

    try{
         req.user.tokens=req.user.tokens.filter((currentElement)=>{
            return currentElement.token !==req.token
            
        })
        res.clearCookie('jwt');
        console.log('logout successfully')
        await req.user.save();
        res.redirect('/login')

    }
    catch(error){
        res.status(500).send('logout errror')
    }

})





    //!;;;;;;;;;;;;;;;;;;;;;;;;;;;;    Post data
    
    

 


app.post('/register',async(req,res)=>{
    // const v=req.body.firstname;
    
    try{

        const password=req.body.password;
        const cpassword=req.body.confirmpassword;
        

        if(password===cpassword){
            const user=new Student({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                phone:req.body.phone,
                password:password,
                confirmpassword:cpassword,
                gender:req.body.gender
            })
            console.log(user);
           //?^  token creation
            
            const token = await user.generateAuthToken();
            console.log(token);
            console.log("things happen")

            //?~^  Cookie creation 

            res.cookie("jwt", token,{
                expires:new Date(Date.now()+ 5000000),
                httpOnly:true
             })
             


            const register=await user.save();
            console.log(register)
            // res.status(201).render('/index', {first:req.body.firstname});
            res.status(201).redirect('/read')
        
            }
            else{
            res.redirect("/")
            }
    }catch(err){
        res.status(404).send(err)
        console.log(err)

    }
})

app.post('/login',async(req,res)=>{
    try{
       const email=req.body.email;  
       const password=req.body.password; 
       const firstname=req.body.firsname;

   const user = await Student.findOne({email:email});
    console.log(user.password);
    console.log(password)

    //! check user passsword and db password is same or not
    const isMatch=await bcrypt.compare(password, user.password)

    
    //! token creation
    const token= await user.generateAuthToken();
    console.log(token);
    
    //! Cookies creation

    res.cookie("jwt", token,{
        expires:new Date(Date.now()+ 5000000),
        httpOnly:true
     })


    console.log(isMatch);

    if (isMatch){
        res.status(200).redirect("/index")
     }
    else{
        res.redirect("/login")
    }
    // res.render("register");
}
      catch(error){
        res.status(400).send(error)
    }
})





app.listen(port,()=>{
    console.log('connect');
});



//?? npm run dev, nodemon src/js.js