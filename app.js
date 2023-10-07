require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();

const cookieParser=require('cookie-parser');
app.use(express.json());
app.use(cookieParser());

//connect to db
mongoose.connect(
    process.env.MONGO_URL + 'college_cupid'
).then(()=>{
    console.log('Connected to Database');
}).catch((err)=>{
    console.log(err);
});

const userRouter=require("./routes/user");
const resultsRouter=require("./routes/results");

app.use('/user', userRouter);
app.use("/results", resultsRouter);

app.listen(process.env.PORT, () => {
    console.log('Server listening on port ' + process.env.PORT);
});