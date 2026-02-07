const Event = require("../models/Events.js");

exports.getEvents = async (req, res) => {
    const events = await Event.find()
                            .sort({ createdAt: -1 });
    res.json({ 
        success: true, 
        events 
    });
},

exports.createEvent = async (req, res) => {
    const { name, title, description, startsAt, endsAt } = req.body;
    const event = await Event.create(
        { 
            name, title, description, startsAt, endsAt 
        }
    );

    res.json({ 
        success: true, 
        event 
    });
},

exports.updateEvent = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const event = await Event.findByIdAndUpdate(
        id, 
        updateData, 
        { 
            new: true, 
            runValidators: true 
        }
    );

    res.json({ 
        success: true, 
        event 
    });
},

exports.deleteEvent = async (req, res) => {
    const { id } = req.params;
    
    await Event.findByIdAndDelete(id);
    res.json({ 
        success: true, 
        message: "Event deleted successfully" 
    });
}
