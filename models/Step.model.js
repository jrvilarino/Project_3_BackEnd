const { Schema, Types, model } = require("mongoose");

const StepSchema = new Schema({
  description: { type: String, required: true, trim: true },
  done: {type: Boolean, default: false},
  taskid: { type: Types.ObjectId, ref: "Task" }

});

const StepModel = model("Step", StepSchema);

module.exports = StepModel;
