const express = require("express");
const {userModel,movieModal} = require("./moviemodal");
const app = express();
const salt = 10;
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");



app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.listen(process.env.PORT || 3004,(err)=>{
    if(!err){
        console.log("server is runing at 3004");
    }else{
        console.log(err);
    }
});

mongoose.connect("mongodb+srv://Titan:Hakunamatata@movielist.s4vaek4.mongodb.net/nodetest?retryWrites=true&w=majority",()=>{
    console.log("connected to db");
},(err)=>{
    console.log(err);
});

app.get("/",(req,res)=>{
    res.send("Backend Works");
});

app.post("/register",(req,res)=>{
    bcrypt.genSalt(salt,(err,hashSalt)=>{
        bcrypt.hash(req.body.password,hashSalt,(err,passwordHash)=>{
            userModel.create({name: req.body.name,email: req.body.email,password: passwordHash}).then((user)=>{
                res.status(200).send(`${req.body.name} created successfully`);
            }).catch((err)=>{
                res.status(400).send(err);
            })
        })
    })
});

app.post("/login",(req,res)=>{
    userModel.find({email: req.body.email}).then((user)=>{
        if(user.length){
            bcrypt.compare(req.body.password,user[0].password).then((val)=>{
                if(val){
                    const authToken = jwt.sign(req.body.email,process.env.SECRET_KEY);
                
                    res.status(200).send({"status":"success","Token":authToken});
                }
            })
        }else{
            res.status(400).send("user not exixts");
        }
    })
});





// posting the movie data
app.post("/post",async (req,res)=>{
    if( await req.headers.authorization) {
        const  email = await jwt.verify(req.headers.authorization,process.env.SECRET_KEY);
        await movieModal.create({Movie_Name: req.body.Movie_Name, Rating: req.body.Rating,Cast: req.body.Cast,Genre: req.body.Genre,user: email, Date: new Date().toLocaleString("en-US",{timeZone: 'Asia/Kolkata'})}).then((data)=>{
            res.status(200).send({"status":"post created","data":data});
        }).catch((err)=>{
            res.status(400).send("user not auth");
        })
    }
    else{
        res.status(400).send("missing token");
    }
});


// getting the data in response
app.get("/post",async (req,res)=>{
    if (await req.headers.authorization){
        const email = await jwt.verify(req.headers.authorization,process.env.SECRET_KEY);
        await movieModal.find({user: email}).then((data)=>{
            res.status(200).send(data);
        }).catch((err)=>{
            res.status(400).send("user not auth");
        })
    }
    else{
        res.status(400).send("missing token");
    }
});

// updating the data using params
app.put("/post/:id",async (req,res)=>{
    // console.log(req.params);
    if( await req.headers.authorization){
        await movieModal.find({_id: req.params.id}).then((post)=>{
            const email = jwt.verify(req.headers.authorization,process.env.SECRET_KEY);//authori=>{email,secretkey}=>verify(abcdefg,defg)=>abc
            if(post[0].user === email){
                movieModal.updateOne({_id: req.params.id},{$set: req.body}).then((movieData)=>{//
                    res.status(200).send({"status":"movie updated"});
                }).catch((err)=>{
                    res.status(400).send("can't update");
                })
            }else{
                res.status(400).send("email in not valid");
            }
        }).catch((err)=>{
            res.status(400).send("id is not present");
        })
    }else{
        res.status(400).send("missing token");
    }
});

// deleting the data using params
app.delete("/post/:id", async (req,res)=>{
    if(await req.headers.authorization){
        await movieModal.find({_id: req.params.id}).then((post)=>{
            const email = jwt.verify(req.headers.authorization,process.env.SECRET_KEY);
            if(post[0].user === email){
                movieModal.deleteOne({_id: req.params.id}).then(()=>{
                    res.status(200).send({"status":"Successfully deleted"});
                }).catch((err)=>{
                    res.status(400).send("can't delete");
                })
            }else{
                res.status(400).send("invalid email");
            }
        }).catch((err)=>{
            res.status(400).send("id is not present");
        })
    }else{
        res.status(400).send("mising token");
    }
});