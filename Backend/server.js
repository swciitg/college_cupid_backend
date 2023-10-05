require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const user=require("./routes/user");
const result=require("./routes/result");
const {authorisation}=require("./authentication/jwt");
const cookieParser=require('cookie-parser');
app.use(express.json());
app.use(cookieParser());

//connect to db
mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`connected to db & listening to the port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log(err);
})

app.use(authorisation);     
app.use('/user',user);
app.use("/result",result);
