const Confessions = require("../models/confession.js");
const { CONFESSIONS_TYPE_ENUM , CONFESSIONS_REPORTS_ENUM } = require("../shared/constants.js");
const {DetectToxicity , RemoveBadWords} = require("../utils/profanityCheck.js");
const UserProfile = require('../models/UserProfile.js');
const { GenerateHash, VerifyHash } = require('../utils/hashing.js');

exports.getConfession = async (req, res) => {
    /** 
    * returns back all the confessions (do not return the emails of user)
    * GET request , protected route for authorized user
    * /confession/?page=&type=
    * paginations in query - 20 confession at a time
    * filters in query - most liked OR most recent
    */

    let { page, type } = req.query;

    page = Number(page);
    if (!Number.isInteger(page) || page < 0) page = 0;

    const LIMIT = 20;

    let filter = {};
    if (CONFESSIONS_TYPE_ENUM.includes(type)) {
        filter.typeOfConfession = type;
    }

    const totalConfessions = await Confessions.countDocuments(filter);

    if (totalConfessions === 0) {
        return res.json({
            success: true,
            data: []
        });
    }

    const maxPage = Math.floor(totalConfessions / LIMIT);
    if (page > maxPage) {
        page = page % (maxPage + 1);
    }

    const confessions = await Confessions.find(filter)
        .select("-encryptedEmail -reports -replies")
        .sort({ createdAt: -1 })
        .skip(page * LIMIT)
        .limit(LIMIT);

    return res.json({
        success: true,
        data: confessions
    });
}

exports.getMyConfession = async(req, res) => {
    /**
     * POST request - expects the encrypted email to find and return the confessions made by this user's email
     * /confessions/self
     * body has the encrypted email
     */
    const { encryptedEmail } = req.body;

    const hashedEmail = await GenerateHash(encryptedEmail);

    const myConfessions = await Confessions
                                .find({ encryptedEmail : hashedEmail })
                                .sort({createdAt : -1});

    res.status(200).json({
        success: true,
        data: myConfessions
    });
}

exports.createConfession = async(req, res) => {
    /** 
    * POST - expects the encrypted email(NOT THE EXACT EMAIL), text !== undefined || text.trim().lenght > 0
    * /confession
    * protected route for authorized user
    * post confession only after necessary checks
    * 
    * first take the encryptedEmail
    * then check for the hate speeches/violatations 
    * if still allowed, then blur sussy words using bad-words
    * then hash email using argon2
    * then create a new confession using the hashed encrypted email, text and type
    * 
    * next upgrades - inclusion of songs used
    */
    const { encryptedEmail, text, typeOfConfession } = req.body;

    if (!encryptedEmail) {
        return res.status(400).json({
            success: false,
            message: "Encrypted email is required"
        });
    }

    if (typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Confession text is required"
        });
    }

    if(typeof typeOfConfession !== "string" || typeOfConfession.trim().length === 0) {
        typeOfConfession = "";
    }

    if(!CONFESSIONS_TYPE_ENUM.includes(typeOfConfession)) {
        return res.json({
            success:false ,
            message : "Confession type could not be found"
        })
    }

    const isToxic = await DetectToxicity(text);
    if (isToxic) {
        return res.status(403).json({
            success: false,
            message: "Confession contains hate speech or violations"
        });
    }

    const cleanedText = RemoveBadWords(text);

    const hashedEmail = await GenerateHash(encryptedEmail);

    const confession = await Confessions.create({
        encryptedEmail: hashedEmail,
        text: cleanedText,
        typeOfConfession: typeOfConfession
    });

    res.json({
        success: true,
        data: confession
    });
}

exports.reactToConfession = async(req, res) => {
    /**
     * PUT request - expects the email of the reacted user, reaction utf-8
     * /confession/react/:id
     * reactions are utf-8 characters - strings
     * remove any reaction that exists previously
     * 
     * validate the fields first
     * then check if the confession exists with the id
     * next check if the user has already reacted - then replace the reaction
     * else push the new reaction
     */ 
    const { id } = req.params;
    
    const { reaction } = req.body;
    if(typeof reaction !== "string" || reaction.trim().length === "") {
        return res.json({
            success: false,
            message : "Reaction is mandatory field"
        });
    }
    
    const userEmail = req.email;
    const user = await UserProfile.findOne({ email:userEmail }).select("_id email");
    if(!user) {
        return res.json({
            success: false ,
            message : "Email not valid"
        });
    } 

    const findConfession = await Confessions.findById(id).select("-encryptedEmail -reports -replies");
    if(!findConfession) {
        return res.json({
            success: false,
            message : "Confession Not Found"
        });
    }

    let replaced = false;
    findConfession.reactions = findConfession.reactions.map(reactionObj => {
        if (reactionObj.user.toString() === user._id.toString()) {
            replaced = true;
            return {
                user: user._id,
                reaction
            };
        }
        return reactionObj;
    });

    if (!replaced) {
        findConfession.reactions.push({
            user: user._id,
            reaction
        });
    }

    await findConfession.save();

    return res.json({
        success: true,
        message: "Reaction Successful",
        data: findConfession
    });

}

exports.removeReaction = async(req, res) => {
    /**
     * DELETE request /confession/react/:id
     * protected route
     * remove existing reaction after all checks as in reactToConfession()
     */
    const { id } = req.params;
    
    const userEmail = req.email;
    const user = await UserProfile.findOne({ email:userEmail }).select("_id email");
    if(!user) {
        return res.json({
            success: false ,
            message : "Email not valid"
        });
    } 

    const findConfession = await Confessions.findById(id).select("-encryptedEmail -reports -replies");
    if(!findConfession) {
        return res.json({
            success: false,
            message : "Confession Not Found"
        });
    }
    
    const initialLength = findConfession.reactions.length;
    findConfession.reactions = findConfession.reactions.filter(
        reactionObj => reactionObj.user.toString() !== user._id.toString()
    );

    if (findConfession.reactions.length === initialLength) {
        return res.json({
            success: false,
            message: "No Reaction found"
        });
    }

    await findConfession.save();

    return res.json({
        success: true ,
        message : "Reaction removed successfully",
        data: findConfession
    })

}

exports.reportConfession = async(req, res) => {
    /**
     * PUT Request - expects the id of the confession in url params and the category
     * /confession/report/:id
     * 
     * first validate all the input fields - check if the category is present in the CONFESSIONS_REPORTS_ENUM
     * check is the user is valid and if the confession id is existing or not
     * then check if a user._id has already reported or not, if yes then return back
     * else add a report and save
     */
    const { id } = req.params;
    const { category } = req.body;

    if (!CONFESSIONS_REPORTS_ENUM.includes(category)) {
        return res.json({
            success: false,
            message: "Report type is not Valid"
        });
    }

    const userEmail = req.email;
    const user = await UserProfile.findOne({ email: userEmail }).select("_id email");
    if (!user) {
        return res.json({
            success: false,
            message: "Invalid User Email"
        });
    }

    const findConfession = await Confessions.findById(id).select("-encryptedEmail -replies");
    if (!findConfession) {
        return res.json({
            success: false,
            message: "Confession Not Found"
        });
    }

    const alreadyReported = findConfession.reports.some(
        reportObj => reportObj.user.toString() === user._id.toString()
    );

    if (alreadyReported) {
        return res.json({
            success: true,
            message: "Already Reported"
        });
    }

    findConfession.reports.push({
        category,
        user: user._id
    });

    await findConfession.save();

    return res.json({
        success: true,
        message: "Confession reported successfully"
    });
}

exports.getReportedConfession = async (req, res) => {
    const confessions = await Confessions.find({
        $expr: { 
            $gt: [
                { $size: "$reports" }, 10
            ] 
        }
    }).select("-encryptedEmail -reactions");

    return res.json({
        success: true,
        data: confessions
    });
};

exports.deleteConfession = async(req, res) => {
    /**
     * DELETE Request /confession/:id
     * protected route
     * expects the encryptedEmail in the body
     * 
     * first get the encryptedEmail and validate the input field
     * then verify if the id of confession and hashed encrypted email is matching
     * then delete it
     */

    const { id } = req.params;
    const { encryptedEmail } = req.body;

    if (!id || !encryptedEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const confession = await Confessions.findById(id);
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    const isMatch = await VerifyHash(
      confession.encryptedEmail,
      encryptedEmail
    );

    if (!isMatch) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Confessions.deleteOne({ _id: id });

    return res.status(200).json({ message: "Confession deleted successfully" });
}

exports.deleteConfessionAdmin = async(req, res) => {
    /**
     * DELETE Request /confession/admin/:id
     * only for admin 
     * has the :id in params 
     */
    const {id} = req.params;
    const deleted = await Confessions.findByIdAndDelete({_id : id}) ;
    if(!deleted) {
        return res.json({
            success: false,
            message: "Confession not found"
        });
    }
    return res.json({
        success:true,
        message : "Delete Successfull"
    });
}