const User = require('../models/user');

exports.addCrush = async(req, res) => {
    if(req.body==null)return res.send("invalid")

    try {
        const user = await User.findOne({email: req.email});
        user.crushes.push(req.body.sharedSecret);
        user.encryptedCrushes.push(req.body.encryptedCrushEmail);

        await User.findOneAndUpdate({email:req.email}, user);
        
        res.send({message: "Crush added successfully"});
    } catch (error) {
        res.send({message: error});
    }
};

exports.removeCrush = async(req, res) => {
    if(req.body==null)return res.send("invalid");

    function arrayRemove(arr, value) {
        return arr.filter(function (geeks) {
            return geeks != value;
        });
    }
    const user = await User.findOne({email: req.email});
    const crushes = user.crushes;
    const encryptedCrushes = user.encryptedCrushes;

    const newCrushes = arrayRemove(crushes,req.query.sharedSecret);
    const newEncryptedCrushes = arrayRemove(encryptedCrushes, req.query.encryptedCrushEmail);

    try {
        await User.findOneAndUpdate({email: req.email}, {
            crushes: newCrushes,
            encryptedCrushes: newEncryptedCrushes
        });

        res.send({message: 'Crush deleted successfully'});
    } catch (error) {
        res.send({message: error});
    }
};

exports.getAllCrushes = async(req, res) => {
    if(req.body==null)return res.send("invalid")
    
    try{
        const user = await User.findOne({email: req.email});

        res.send({encryptedCrushes: user.encryptedCrushes});
    }
    catch(err){
        res.send({message: err});
    }
};