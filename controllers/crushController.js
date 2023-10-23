const PersonalInfo = require('../models/PersonalInfo');

exports.addCrush = async(req, res) => {
    try {
        const user = await PersonalInfo.findOne({email: req.email});
        user.crushes.push(req.body.sharedSecret);
        user.encryptedCrushes.push(req.body.encryptedCrushEmail);

        await PersonalInfo.findOneAndUpdate({email:req.email}, user);
        
        res.send({message: "Crush added successfully"});
    } catch (error) {
        res.send({message: error});
    }
};

exports.removeCrush = async(req, res) => {
    function arrayRemove(arr, value) {
        return arr.filter(function (item) {
            return item != value;
        });
    }

    try {
        const user = await PersonalInfo.findOne({email: req.email});
        const crushes = user.crushes;
        const encryptedCrushes = user.encryptedCrushes;

        const newCrushes = arrayRemove(crushes,req.query.sharedSecret);
        const newEncryptedCrushes = arrayRemove(encryptedCrushes, req.query.encryptedCrushEmail);

        await PersonalInfo.findOneAndUpdate({email: req.email}, {
            crushes: newCrushes,
            encryptedCrushes: newEncryptedCrushes
        });

        res.send({message: 'Crush deleted successfully'});
    } catch (error) {
        res.send({message: error});
    }
};

exports.getAllCrushes = async(req, res) => {    
    try{
        const user = await PersonalInfo.findOne({email: req.email});

        res.send({encryptedCrushes: user.encryptedCrushes});
    }
    catch(err){
        res.send({message: err});
    }
};