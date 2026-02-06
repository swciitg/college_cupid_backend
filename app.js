const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const initSocket = require("./services/socket/index.js");
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { errorHandler } = require('./middlewares/errorHandler');
const morgan = require('morgan');
const router = require('./routers/router');
const { NotFoundError } = require('./errors/notFoundError');
const corsMiddleware = require('./middlewares/corsMiddleware');
const securityKeyMiddleware = require('./middlewares/securityKeyMiddleware');

app.use("/assets", express.static(path.join(__dirname, 'assets')));
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(morgan('dev'));
app.use(corsMiddleware);

// API Routers
app.use('/', router.authRouter);
app.use(process.env.API_URL, router.imageRouter);

app.get('/terms', (_req, res) => res.render('termsOfUse'));
app.get('/csae', (_req, res) => res.render('csae'));
app.get('/', (_req, res) => {
    res.send('<h1>Welcome to CollegeCupid 2.0</h1>');
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
app.use(process.env.API_URL, router.faceverifyRouter);

app.use(process.env.API_URL, router.replyRouter);
app.use(process.env.API_URL, router.confessionRouter);

initSocket(server) 

app.all('*', (req, _res, next) => {
    const err = new NotFoundError(`Can't find ${req.originalUrl} on the server!`);
    next(err);
});

app.use(errorHandler);

server.listen(process.env.PORT, async () => {
    console.log('Server listening on port ' + process.env.PORT);
    await mongoose.connect(process.env.MONGO_URL + process.env.DB_NAME);
    console.log('Connected to database');
});
