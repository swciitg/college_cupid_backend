const User = require('../models/user');

exports.clearUsers = async (req, res) => {
    try{
        await User.deleteMany({});
        res.send('success');
    }catch(e){
        res.send({message: e});
    }
}

exports.postUserInfo = async (req, res) => {
    var user=req.body;
    try {
        user.profilePicUrl = req.imageUrl;
        console.log(user);

        const newUser = new User(user);
        await newUser.save();

        res.status(200).send(newUser);

    } catch (error) {
        console.log(error);
        res.send({
            message: error.message,
        });
    }
};

exports.getAllUsers = async(req, res) => {
    try {
        const users = await User.find();
        var usersInfo = [];
        users.forEach((user) => {
            usersInfo.push({
                email: user.email,
                name: user.name,
                profilePicUrl: user.profilePicUrl ?? '',
                publicKey: user.publicKey,
                gender: user.gender,
                bio: user.bio,
                yearOfStudy: user.yearOfStudy,
                program: user.program,
                interests: user.interests
            });
        });

        console.log(usersInfo);

        res.json({users: usersInfo});
    } catch (error) {
        res.send({message: error});
    }
};

exports.getUserInfo = async(req, res) => {
    try{
        const user = await User.findOne({email: req.params.email});
        res.send({
            email: user.email,
            name: user.name,
            profilePicUrl: user.profilePicUrl ?? '',
            publicKey: user.publicKey,
            gender: user.gender,
            bio: user.bio,
            yearOfStudy: user.yearOfStudy,
            program: user.program,
            interests: user.interests
        });
    }
    catch(err){
        res.send({message: err});
    }
};

exports.updateProfile = async(req, res) => {
    var user = req.body;
    try{
        // user.profilePicUrl = await uploadImage(req);
        await User.findOneAndUpdate({email: req.email}, user);
        res.send({message: "Profile updated successfully"});
    }
    catch(err){
        res.send(err);
    }
};

exports.getPersonalInfo = async(req, res) => {
    try {
        const user = await User.findOne({email: req.email});
        res.send({personalInfo: user});
    } catch (error) {
        res.status(error.statusCode).send(error.message);
    }
};