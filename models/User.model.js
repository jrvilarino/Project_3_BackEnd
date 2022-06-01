const { Schema, Types, model } = require("mongoose");

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["ADMIN", "USER"],
    required: true,
    default: "USER",
  },
  tasks: {
    type: [{ type: Types.ObjectId, ref: "Task" }],
    // validation: (Rule) =>
    //   Rule.max(3).warning(
    //     `The amount of tasks shouldn't be more than 3 per day.`
    //   ),
  },
  profileimage: { type: String, default: "../img/UserImages.png" },
});

const UserModel = model("User", UserSchema);

module.exports = UserModel;
