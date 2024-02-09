require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

const { errorHandler } = require('./middlewares/errorHandler');
const morgan = require('morgan');
const router = require('./routers/router');
const { NotFoundError } = require('./errors/notFoundError');
const corsMiddleware = require('./middlewares/corsMiddleware');
const securityKeyMiddleware = require('./middlewares/securityKeyMiddleware');

app.set('view engine', 'ejs');

app.use(express.json());
app.use(morgan('dev'));
app.use(corsMiddleware);

// API Routers
app.use('/', router.authRouter);
app.use(process.env.API_URL, router.imageRouter);
app.get('/terms', (_req, res) => {
    res.render('termsOfUse');
});
app.get('/', (_req, res) => {
    res.send('<h1>Welcome to CollegeCupid</h1>');
});

app.get('/pdf', (_req, res) => {
    const filePath = path.join(__dirname, 'puppylove.pdf');

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(err);
            return res.status(404).send('File not found');
        }

        // Set the appropriate content type
        res.setHeader('Content-Type', 'application/pdf');

        // Stream the file to the client
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    });
});

app.use(securityKeyMiddleware);

// API Routers
app.use(process.env.API_URL, router.userRouter);
app.use(process.env.API_URL, router.crushRouter);
app.use(process.env.API_URL, router.matchRouter);
app.use(process.env.API_URL, router.reportUserRouter);

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
