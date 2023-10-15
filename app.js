require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
var morgan = require('morgan');

const cookieParser=require('cookie-parser');
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'ejs');

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
// const authRouter = require('./routes/auth');

app.use(morgan('dev'));

// app.use('/auth/microsoft', authRouter);
app.use('/user', userRouter);
app.use("/results", resultsRouter);

app.get('/', (req, res) => {
    res.send('<h1>Welcome to CollegeCupid</h1>')
});

app.listen(process.env.PORT, () => {
    console.log('Server listening on port ' + process.env.PORT);
});