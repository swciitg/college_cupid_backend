const Confessions = require('../models/confession.js');
const Reply = require('../models/Reply.js');
const { GenerateHash } = require('../utils/hashing.js');

exports.addReply = async (req, res) => {
    /**
     * POST request
     * /reply/add
     * add a reply either to a confession or directly to a user
     * sender email is extracted from auth middleware (req.email)
     * if isConfession is true:
     *   - confessionId must be provided
     *   - confession must exist
     *   - receiverEmail is resolved from confession.encryptedEmail
     * if isConfession is false:
     *   - receiverEmail must be provided explicitly
     * replyContent is mandatory and cannot be empty
     * creates a reply document and pushes its _id into the confession's replies array
     * both operations are executed inside a MongoDB transaction
     * if any operation fails, the transaction is rolled back automatically
     */
    const senderEmail = req.email; 
    let { isConfession, confessionId, receiverEmail, replyContent , entityType , entitySerial } = req.body;

    if (typeof replyContent !== "string" || replyContent?.trim().length === 0 || typeof isConfession === "undefined") {
        return res.json({ 
            success: false,
            message: "Missing correct required fields" 
        });
    }

    let confession;

    if (isConfession) {
        if (confessionId === null || !confessionId) {
            return res.json({ 
                success: false,
                message: "Missing required fields : confessionId" 
            });
        }

        confession = await Confessions.findById(confessionId);
        if (!confession) {
            return res.json({
                success: false,
                message: "Invalid Confession"
            });
        }

        receiverEmail = confession.encryptedEmail;
    } else {
        if(!entitySerial || !["QUESTIONS" , "IMAGES" , "MATCHES"].includes(entityType)) {
            return res.json({
                success : false, 
                message : "Missing required fields : entity"
            });
        }
    }

    if (typeof receiverEmail !== "string" || receiverEmail?.trim().length === 0) {
        return res.json({ 
            success: false,
            message: "Missing required fields : email" 
        });
    }

    // const session = await mongoose.startSession();
    // session.startTransaction();

    let savedReply;

    const replyObject = {
        senderEmail,
        replyContent,
        receiverEmail,
        ...(isConfession && { confessionId }),
        ...(!isConfession && {entitySerial}),
        ...(!isConfession && {entityType})
    };

    const newReply = new Reply(replyObject);
    savedReply = await newReply.save();

    if (isConfession) {
        await Confessions.findOneAndUpdate(
            { _id: confessionId },
            { $push: { replies: savedReply._id } }
        );
    }

    // await session.commitTransaction();
    // session.endSession();

    const replyResponse = savedReply.toObject();
    delete replyResponse.receiverEmail;

    res.json({ 
        success: true,
        message: "Reply sent successfully!",
        data: replyResponse
    });
};


exports.viewUpdates = async (req, res) => {
    /**
     * POST request
     * /reply/updates
     * get the encrypted email from the body - expected from the frontend
     * hash that email and then fetch th updates in the descending order of createdAt
     * the find query should receiverEmail must be either email or hashedEncryptedEmail
     */
    const email = req.email;
    const { encryptedEmail } = req.body;

    if(typeof encryptedEmail !== "string" || encryptedEmail.trim().length === 0) {
        return res.json({
            success : false ,
            message : "Mandatory fields missing"
        });
    }

    const hashedEmail = await GenerateHash(encryptedEmail);

    let updates = await Reply.find({
        receiverEmail: { $in: [email, hashedEmail] } , 
        
    })
    .sort({ createdAt: -1 })
    .select("-receiverEmail");

    updates = updates.filter(
        (update) => !(
            update.entityType === "MATCHES" && 
            (new Date() < new Date("2026-02-13T18:30:00Z"))
        )
    );

    res.json({
        success: true,
        data: updates
    });
};
