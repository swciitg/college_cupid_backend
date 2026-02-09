const CrushesCount = require('../models/CrushesCount');
const PersonalInfo = require('../models/PersonalInfo');
const Reply = require('../models/Reply');

exports.addCrush = async(req, res, next) => {
    // return res.json({
    //     success: false,
    //     message: "You cannot add crushes anymore!"
    // });
    const user = await PersonalInfo.findOne({email: req.email});

    if(user.sharedSecretList.length === 7){
        return res.json({
            success: false, 
            message: "You cannot add more than seven crushes."
        });
    } 

    const crushEmail = req.body.crushEmail;
    if(typeof crushEmail !== "string" || crushEmail.trim().length === 0) {
        return res.json({
            success : false ,
            message : "Crush Email is also a required field"
        });
    }

    if(user.sharedSecretList.includes(req.body.sharedSecret)) {
        return res.json({
            success: false, 
            message: "User is already added as your crush."
        });
    }

    const otherUser = await PersonalInfo.findOne({
        email : crushEmail ,
        sharedSecretList : req.body.sharedSecret
    });
                
    if (otherUser) {
        await Reply.create({
            receiverEmail: crushEmail,
            senderEmail: req.email,
            replyContent: "You have a match",
            entityType: "MATCHES",
            entitySerial: 0
        });

        await Reply.create({
            receiverEmail: req.email,
            senderEmail: crushEmail,
            replyContent: "You have a match",
            entityType: "MATCHES",
            entitySerial: 0
        });

        await Promise.all([
            PersonalInfo.findOneAndUpdate(
                { email: req.email },
                {
                    $push: { matchedEmailList: crushEmail }
                }
            ),
            PersonalInfo.findOneAndUpdate(
                { email: crushEmail },
                {
                    $push: { matchedEmailList: req.email },
                    $pull: { sharedSecretList: req.body.sharedSecret }
                }
            )
        ]);

        return res.json({
            success: true, 
            message: "Crush added successfully!",
            isMatch : true
        });
    } 
            
    await PersonalInfo.findOneAndUpdate(
        { email: req.email },
        {
            $push: { sharedSecretList: req.body.sharedSecret }
        },
        { runValidators: true }
    );

    return res.json({
        success: true, 
        message: "Crush added successfully!",
        isMatch : false
    });
};

exports.updateCrushes = async(req, res, next) => {
    try {
        const {sharedSecretList} = req.body;
        if(!Array.isArray(sharedSecretList)) {
            return res.json({
                success: false,
                message: "shared secret list must be an array"
            });
        }
        if(sharedSecretList.length > 7) {
            return res.json({
                success: false,
                message: "you cannot have more than seven crushes"
            });
        }
        const updatedUser = await PersonalInfo.findOneAndUpdate(
            {email: req.email},
            {sharedSecretList},
            {new: true, runValidators: true}
        );
        if(!updatedUser) {
            return res.json({
                success: false,
                message: "user not found"
            })
        }
        return res.json({
            success: true,
            message: "crush list updated successfully",
            sharedSecretList: updatedUser.sharedSecretList,
        })
    } catch (error) {
        next(error);
    }
}

exports.increaseCount = async(req, res, next) => {
    // return res.json({
    //     success: false,
    //     message: "You cannot add crushes anymore!"
    // });
    const user = await CrushesCount.findOne({email: req.query.crushEmail});
    if(user){
        await CrushesCount.findOneAndUpdate({ email: req.query.crushEmail }, {
            crushesCount: user.crushesCount + 1 }, {runValidators: true}
        );
    }else{
        await CrushesCount.create({
            email: req.query.crushEmail,
            crushesCount: 1
        });
    }
    res.json({
        success: true,
        message: 'Count updated successfully!'
    });
}

exports.decreaseCount = async(req, res, next) => {
    // return res.json({
    //     success: false,
    //     message: "You cannot remove crushes anymore!"
    // });
    const user = await CrushesCount.findOne({email: req.query.crushEmail});
    if(user && user.crushesCount > 0){
        await CrushesCount.findOneAndUpdate({ email: req.query.crushEmail }, {
            crushesCount: user.crushesCount - 1 }, {runValidators: true}
        );
    }else{
        return res.json({
            success: false,
            message: 'Count cannot be negative!'
        });
    }
    res.json({
        success: true,
        message: 'Count updated successfully!'
    });
}

exports.getCount = async(req, res, next) => {
    const user = await CrushesCount.findOne({email: req.email});
    if(user){
        return res.json({
            success: true,
            crushesCount: user.crushesCount
        })
    }else{
        return res.json({
            success: true,
            crushesCount: 0
        });
    }
}

exports.removeCrush = async(req, res, next) => {
    try {
        const { sharedSecret } = req.body;

        if (!sharedSecret) {
            return res.json({
                success: false,
                message: "Shared secret is required"
            });
        }

        const user = await PersonalInfo.findOne({email: req.email});
        
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const sharedSecretList = user.sharedSecretList;
        
        // Check if the shared secret exists
        if (!sharedSecretList.includes(sharedSecret)) {
            return res.json({
                success: true,
                message: "Crush not found in your list"
            });
        }

        // Find the other user who has this sharedSecret to identify match
        const otherUser = await PersonalInfo.findOne({
            email: { $ne: req.email },
            sharedSecretList: sharedSecret
        });

        // Remove the shared secret ONLY from current user's list
        const newSharedSecretList = sharedSecretList.filter(item => item !== sharedSecret);

        await PersonalInfo.findOneAndUpdate(
            {email: req.email}, 
            {sharedSecretList: newSharedSecretList}, 
            {runValidators: true}
        );

        // If there was a match (other user also had this sharedSecret), remove match updates
        if (otherUser) {
            // Delete all match-related Reply entries between these two users
            await Reply.deleteMany({
                entityType: "MATCHES",
                $or: [
                    { senderEmail: req.email, receiverEmail: otherUser.email },
                    { senderEmail: otherUser.email, receiverEmail: req.email }
                ]
            });

            // Remove from matchedEmailList for both users
            await Promise.all([
                PersonalInfo.findOneAndUpdate(
                    { email: req.email },
                    { $pull: { matchedEmailList: otherUser.email } }
                ),
                PersonalInfo.findOneAndUpdate(
                    { email: otherUser.email },
                    { $pull: { matchedEmailList: req.email } }
                )
            ]);
            // Note: We keep the other user's sharedSecret intact - they can still see you in their crushes
        }

        res.json({
            success: true,
            message: 'Crush removed successfully'
        });
    } catch (error) {
        next(error);
    }
}; 

exports.checkCrushExists = async(req, res, next) => {
    try {
        const { sharedSecret } = req.body;

        if (!sharedSecret) {
            return res.json({
                success: false,
                message: "Shared secret is required"
            });
        }

        const user = await PersonalInfo.findOne({email: req.email});
        
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const exists = user.sharedSecretList.includes(sharedSecret);

        res.json({
            success: true,
            exists: exists
        });
    } catch (error) {
        next(error);
    }
};
