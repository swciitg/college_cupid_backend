const { authenticateToken, verifyAdmin } = require('../middlewares/jwtAuthHandler');
const eventsController = require('../controllers/eventsContoller.js');
const { Router } = require('express');
const asyncErrorHandler = require('../handlers/asyncErrorHandler');
const eventsRouter = Router();

eventsRouter.get(
    "/events/" ,
    authenticateToken ,
    asyncErrorHandler(eventsController.getEvents)
);

eventsRouter.post(
    "/events/" ,
    authenticateToken ,
    verifyAdmin ,
    asyncErrorHandler(eventsController.createEvent)
);

eventsRouter.put(
    "/events/:id" ,
    authenticateToken ,
    verifyAdmin ,
    asyncErrorHandler(eventsController.updateEvent) 
);

eventsRouter.delete(
    "/events/:id" ,
    authenticateToken ,
    verifyAdmin ,
    asyncErrorHandler(eventsController.deleteEvent)
);

module.exports = { eventsRouter };