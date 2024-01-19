const ReportUserContent = require('../models/ReportUserContent');

exports.reportAUser = async(req, res, next) => {
    const reportContent = await ReportUserContent.create({
        reasonForReporting: req.body.reasonForReporting,
        reportedEmail: req.body.reportedEmail,
        reportedByEmail: req.email
    });
    res.json({success: true, reportContent: reportContent});
}