require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cookieParser=require('cookie-parser');
const { errorHandler } = require('./middlewares/errorHandler');
const morgan = require('morgan');
const router = require('./routers/router');

app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'ejs');

app.use(morgan('dev'));

// API Routers
app.use('/', router.authRouter);
app.use('/', router.userRouter);
app.use('/', router.crushRouter);
app.use('/', router.matchRouter);

app.get('/', (req, res) => {
    res.send('<h1>Welcome to CollegeCupid</h1>')
});

app.use(errorHandler);

app.listen(process.env.PORT, async () => {
    console.log('Server listening on port ' + process.env.PORT);
    await mongoose.connect(process.env.MONGO_URL + 'college_cupid');
    console.log('Connected to database')
});