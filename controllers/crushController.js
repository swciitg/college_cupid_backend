const CrushesCount = require('../models/CrushesCount');
const PersonalInfo = require('../models/PersonalInfo');

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
    } else {
        const crushEmail = req.body.crushEmail;
        if(typeof crushEmail !== "string" || crushEmail.trim().length === 0) {
            return res.json({
                success : false ,
                message : "Crush Email is also a required field"
            });
        }

        if(user.sharedSecretList.includes(req.body.sharedSecret)==false){
            user.sharedSecretList.push(req.body.sharedSecret);
        }else{
            return res.json({
                success: false, 
                message: "User is already added as your crush."
            });
        }
    
        await PersonalInfo.findOneAndUpdate(
            {
                email : crushEmail
            } , {
                $push : {
                    receivedLikesSecrets : req.body.sharedSecret
                }
            } , {
                runValidators : true
            }
        );
        await PersonalInfo.findOneAndUpdate({email:req.email}, user, {runValidators: true});
        
        return res.json({
            success: true, 
            message: "Crush added successfully!"
        });
    }
};

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
    return res.json({
        success: false,
        message: "You cannot remove crushes anymore!"
    });
    function arrayRemove(arr, value) {
        return arr.filter(function (item) {
            return item != value;
        });
    }

    const user = await PersonalInfo.findOne({email: req.email});
    const sharedSecretList = user.sharedSecretList;

    const newSharedSecretList = arrayRemove(sharedSecretList,sharedSecretList[req.query.index]);

    await PersonalInfo.findOneAndUpdate({email: req.email}, {
        sharedSecretList: newSharedSecretList,
    }, {runValidators: true});

    res.json({
        success: true,
        message: 'Crush deleted successfully'
    });
};