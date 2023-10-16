const User = require('../models/user');

exports.addCrush = async(req, res) => {
    if(req.body==null)return res.send("invalid")

    try {
        await User.findOneAndUpdate({email:req.email}, {
            $push: {crushes:req.body.sharedSecret}, 
            $push: {encryptedCrushes: req.body.encryptedCrushEmail}
        });
        
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
    const list = user.crushes;
    const newlist = arrayRemove(list,req.params.id);

    try {
        await User.findOneAndUpdate({email: req.email}, {
            crushes: newlist,
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