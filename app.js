require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const { errorHandler } = require('./middlewares/errorHandler');
const morgan = require('morgan');
const router = require('./routers/router');
const { NotFoundError } = require('./errors/notFoundError');

app.set('view engine', 'ejs');

app.use(express.json());
app.use(morgan('dev'));

// API Routers
app.use('/', router.authRouter);
app.use('/', router.userRouter);
app.use('/', router.crushRouter);
app.use('/', router.matchRouter);
app.use('/', router.imageRouter);

app.get('/terms', (_req, res) => {
    res.render('termsOfUse');
});

app.get('/', (_req, res) => {
    res.send('<h1>Welcome to CollegeCupid</h1>');
});

app.all('*', (req, res, next) => {
    const err = new NotFoundError(`Can't find ${req.originalUrl} on the server!`);
    next(err);
});

app.use(errorHandler);

app.listen(process.env.PORT, async () => {
    console.log('Server listening on port ' + process.env.PORT);
    await mongoose.connect(process.env.MONGO_URL + 'college_cupid');
    console.log('Connected to database');
});