const ConfessionReply = require('../models/ConfessionReply');

exports.addReply = async (req, res) => {
    // Corrected: Middleware attaches email to req.email directly
    const senderEmail = req.email; 
    const { confessionId, receiverEmail, replyContent } = req.body;

    if (!confessionId || !receiverEmail || !replyContent) {
        return res.status(400).json({ 
            message: "Missing required fields: confessionId, receiverEmail, or replyContent." 
        });
    }

    const newReply = new ConfessionReply({
        confessionId,
        senderEmail,
        receiverEmail,
        replyContent
    });

    const savedReply = await newReply.save();
    
    res.status(201).json({ 
        message: "Reply sent successfully!", 
        data: savedReply 
    });
};

exports.getUpdates = async (req, res) => {
    // Corrected: Middleware attaches email to req.email directly
    const userEmail = req.email;

    const updates = await ConfessionReply.find({ receiverEmail: userEmail })
        .sort({ createdAt: -1 }) 
        .limit(50); 

    res.status(200).json({ 
        message: "Updates fetched successfully", 
        data: updates 
    });
};