const CrushesCount = require('../models/CrushesCount');
const PersonalInfo = require('../models/PersonalInfo');

exports.addCrush = async(req, res, next) => {
    const user = await PersonalInfo.findOne({email: req.email});

    if(user.crushes.length === 5){
        return res.json({
            success: false, 
            message: "You cannot add more than five crushes."
        });
    } else {
        if(user.crushes.includes(req.body.sharedSecret)==false){
            user.crushes.push(req.body.sharedSecret);
            user.encryptedCrushes.push(req.body.encryptedCrushEmail);
        }else{
            return res.json({
                success: false, 
                message: "User is already added as your crush."
            });
        }
    
        await PersonalInfo.findOneAndUpdate({email:req.email}, user, {runValidators: true});
        
        return res.json({
            success: true, 
            message: "Crush added successfully"
        });
    }
};

exports.increaseCount = async(req, res, next) => {
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
    function arrayRemove(arr, value) {
        return arr.filter(function (item) {
            return item != value;
        });
    }

    const user = await PersonalInfo.findOne({email: req.email});
    const crushes = user.crushes;
    const encryptedCrushes = user.encryptedCrushes;

    const newCrushes = arrayRemove(crushes,crushes[req.query.index]);
    const newEncryptedCrushes = arrayRemove(encryptedCrushes, encryptedCrushes[req.query.index]);

    await PersonalInfo.findOneAndUpdate({email: req.email}, {
        crushes: newCrushes,
        encryptedCrushes: newEncryptedCrushes
    }, {runValidators: true});

    res.json({
        success: true,
        message: 'Crush deleted successfully'
    });
};

exports.getAllCrushes = async(req, res, next) => {
    const user = await PersonalInfo.findOne({email: req.email});

    res.json({
        success: true,
        encryptedCrushes: user.encryptedCrushes
    });
};