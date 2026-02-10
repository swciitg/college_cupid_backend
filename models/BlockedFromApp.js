const { Schema, model } = require("mongoose");

const blockedUserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    isPermanent: {
      type: Boolean,
      default: false,
    },
  }
);


const BlockedUsersFromApp = model("BlockedUsers", blockedUserSchema);
module.exports = BlockedUsersFromApp;
