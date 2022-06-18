const { Schema, Types, model } = require("mongoose");

const TaskSchema = new Schema({
  name: { type: String, required: true, trim: true },
  steps: [{ type: Types.ObjectId, ref: "Step" }],
  createdBy: { type: Types.ObjectId, ref: "User" },
  field: { type: String, enum: ["Work", "Home", "Education"] },
  startdate: { type: Date, required: true },
  enddate: { type: Date, required: true },
  comments: [{ type: String }],
  done: { type: Boolean, default: false },
});

const TaskModel = model("Task", TaskSchema);
// weekday: {
//   type: String,
//   enum: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
//   required: true,
// },
// starttime: { type: String, required: true },
// endtime: { type: String, required: true },

module.exports = TaskModel;
