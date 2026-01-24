const express = require('express');
const confessionController = require("../controllers/confession.js");
const asyncErrorHandler = require('../handlers/asyncErrorHandler');
const { authenticateToken, verifyAdmin } = require('../middlewares/jwtAuthHandler.js');

const confessionRouter = express.Router();

confessionRouter.get('/confession' , authenticateToken , 
    asyncErrorHandler(confessionController.getConfession)
);
confessionRouter.post('/confession/self' , authenticateToken , 
    asyncErrorHandler(confessionController.getMyConfession)
);
confessionRouter.post('/confession' , authenticateToken , 
    asyncErrorHandler(confessionController.createConfession)
);
confessionRouter.put('/confession/react/:id' , authenticateToken , 
    asyncErrorHandler(confessionController.reactToConfession)
);
confessionRouter.delete('/confession/react/:id' , authenticateToken ,
    asyncErrorHandler(confessionController.removeReaction)
);
confessionRouter.put('/confession/report/:id' , authenticateToken , 
    asyncErrorHandler(confessionController.reportConfession)
);
confessionRouter.delete('/confession/:id' , authenticateToken, 
    asyncErrorHandler(confessionController.deleteConfession)
);
confessionRouter.get('/confession/admin/reported' , authenticateToken , verifyAdmin , 
    asyncErrorHandler(confessionController.getReportedConfession)
);
confessionRouter.delete('/confession/admin/:id' , authenticateToken , verifyAdmin , 
    asyncErrorHandler(confessionController.deleteConfessionAdmin)
);


module.exports = {confessionRouter};