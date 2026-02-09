const { Schema, model } = require("mongoose");
const {ZODIAC_ENUM , TYPE_OF_RELATIONSHIP_ENUM , SEXUAL_ORIENTATIONS_ENUM} = require("../shared/constants.js")

const userProfileSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is a required field!"],
  },
  gender: {
    type: String,
    required: [true, "Gender is a required field!"],
  },
  email: {
    type: String,
    required: [true, "Email is a required field!"],
    unique: true,
  },
  age: {
    type: Number,
    required: true,
    default: 18,
    min: [18, "Age must be at least 18"]
  },
  hometown : {
    type:String , 
    required:true,
  },
  program: {
    type: String,
    required: [true, "Program is a required field!"]
  },
  zodiac: {
    type: String,
    required: true,
    enum: ZODIAC_ENUM
  },
  sexualOrientation: {
    type: {
      type:String , 
      required:true ,
      enum : SEXUAL_ORIENTATIONS_ENUM
    } , 
    display : {
      type:Boolean ,
      required:true
    }
  },
  typeOfRelationship : {
    type:String , 
    required : true ,
    enum : TYPE_OF_RELATIONSHIP_ENUM
  },
  interests: {
    type: [String],
    default: [],
    validate: [
      interestArrayLimit,
      "Interests must lie in the range of 5 to 20!",
    ],
  },
  voiceRecordings: [
    {
      question: {
        type: String,
        default: "",
      },
      answer: {
        type: String, // this will be the url of the voice note stored in server
        default: "",
      },
    },
  ],
  profilePicUrls: [
    {
      Url: {
        type: String,
        default: "",
      },
      blurHash: {
        type: String,
        default: null,
      },
    },
  ],
  surpriseQuiz: [
    {
      question: {
        type: String,
        default: "",
      },
      answer: {
        type: String,
        default: "",
      },
    },
  ],
  yearOfJoin: {
    type: Number,
    required: [true, "Year of join is a required field!"],
  },
  relationshipGoals: {
    goal: {
      type: String,
      default: "",
    },
    display: {
      type: Boolean,
      default: false,
    },
  },
  personalityType: {
    type: String,
    default: null,
  },
  publicKey: {
    type: String,
    required: [true, "Public Key is a required field!"],
  },
  whatsappNumber : {
    type: String , 
    required : [true , "Whatsapp number is required field"]
  },
  insta: {
    type : String , 
    required : [true , "Instagram Username is a required field"]
  },
}, {
  timestamps : true
});

function interestArrayLimit(val) {
  return val.length <= 20 && val.length >= 5;
}

const UserProfile = model("UserProfile", userProfileSchema);
module.exports = UserProfile;
