const PersonalInfo = require('../models/PersonalInfo');
const UserProfile = require('../models/UserProfile');

exports.clearUsers = async (req, res) => {
    try {
        await PersonalInfo.deleteMany({});
        await UserProfile.deleteMany({});
        res.send('success');
    } catch (e) {
        res.send({ message: e });
    }
}

exports.postUserProfile = async (req, res) => {
    var userProfile = req.body;
    try {
        userProfile.profilePicUrl = req.imageUrl;
        console.log(userProfile);

        const newUserProfile = new UserProfile(userProfile);
        await newUserProfile.save();

        res.status(200).send(newUserProfile);

    } catch (error) {
        console.log(error);
        res.send({ message: error });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const userProfile = await UserProfile.findOne({ email: req.params.email });
        res.send({userProfile: userProfile});
    }
    catch (err) {
        res.send({ message: err });
    }
};

exports.getAllUserProfiles = async (req, res) => {
    try {
        const userProfiles = await UserProfile.find();
        console.log(userProfiles);

        res.send({ users: userProfiles });
    } catch (error) {
        res.send({ message: error });
    }
};

exports.updateUserProfile = async (req, res) => {
    var profileChanges = req.body;
    try {
        if (req.imageUrl) {
            profileChanges.profilePicUrl = req.imageUrl;
        }
        await UserProfile.findOneAndUpdate({ email: req.email }, profileChanges);
        res.send({ message: "Profile updated successfully" });
    }
    catch (err) {
        res.send({ message: err });
    }
};

exports.postPersonalInfo = async (req, res) => {
    try {
        const myInfo = new PersonalInfo(req.body);
        await myInfo.save();
        res.send({ message: 'Data uploaded successfully' });
    } catch (err) {
        res.send({ message: err });
    }
};

exports.getPersonalInfo = async (req, res) => {
    try {
        const user = await PersonalInfo.findOne({ email: req.email });
        res.send({ personalInfo: user });
    } catch (error) {
        res.status(error.statusCode).send({ message: err });
    }
};