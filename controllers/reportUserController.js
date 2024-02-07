const BlockedUserList = require('../models/BlockedUserList');
const ReportUserContent = require('../models/ReportUserContent');

exports.reportAUser = async(req, res, next) => {
    const reportContent = await ReportUserContent.create({
        reasonForReporting: req.body.reasonForReporting,
        reportedEmail: req.body.reportedEmail,
        reportedByEmail: req.email
    });
    const user = await BlockedUserList.findOne({email: req.email});
    if(user){
        if(user.blockedUsers.includes(req.body.reportedEmail)==false){
            user.blockedUsers.push(req.body.reportedEmail);
            await BlockedUserList.findOneAndUpdate({email: req.email}, user);
        }

        return res.json({
            success: true, 
            reportContent: reportContent, 
            message: 'Successfully reported and blocked the user'
        });
    }else{
        await BlockedUserList.create({email: req.email, blockedUsers: [req.body.reportedEmail]});
        return res.json({
            success: true, 
            reportContent: reportContent, 
            message: 'Successfully reported and blocked the user'
        });
    }
}

exports.unblockUser = async(req, res, next) => {
    function arrayRemove(arr, value) {
        return arr.filter(function (item) {
            return item != value;
        });
    }

    const user = await BlockedUserList.findOne({email: req.email});
    const blockedUsers = user.blockedUsers;

    const newBlockedUsers = arrayRemove(blockedUsers, blockedUsers[req.query.index]);

    await BlockedUserList.findOneAndUpdate({email: req.email}, {
        blockedUsers: newBlockedUsers,
    });

    res.send({
        success: true,
        message: `Unblocked ${blockedUsers[req.query.index]}`
    });
};

exports.getBlockedUsers = async(req, res, next) => {
    const user = await BlockedUserList.findOne({email: req.email});
    if(user){
        return res.json({
            success: true,
            blockedUsers: user.blockedUsers
        });
    }else{
        return res.json({
            success: true,
            blockedUsers: []
        });
    }
};