const PersonalInfo = require('../models/PersonalInfo');

exports.addCrush = async(req, res, next) => {
    const user = await PersonalInfo.findOne({email: req.email});

    if(user.crushes.length == 5){
        res.json({success: false, message: "You cannot add more than five crushes."});
    } else {
        if(user.crushes.includes(req.body.sharedSecret)==false){
            user.crushes.push(req.body.sharedSecret);
            user.encryptedCrushes.push(req.body.encryptedCrushEmail);
        }else{
            res.json({success: false, message: "User is already added as your crush."});
        }
    
        await PersonalInfo.findOneAndUpdate({email:req.email}, user);
        
        res.json({success: true, message: "Crush added successfully"});
    }
};

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
    });

    res.send({message: 'Crush deleted successfully'});
};

exports.getAllCrushes = async(req, res, next) => {
    const user = await PersonalInfo.findOne({email: req.email});

    res.send({encryptedCrushes: user.encryptedCrushes});
};