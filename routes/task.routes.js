const router = require("express").Router();

const Task = require("../models/Task.model");
const User = require("../models/User.model");
const Step = require("../models/Step.model");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

//Post para criar tarefas
router.post("/task", isAuthenticated, attachCurrentUser, async (req, res) => {
  try {
    const { name, field, date, wekday, starttime, endtime, comments } =
      req.body;
    const { _id } = req.user;
    const result = await Task.create({
      name,
      field,
      date,
      wekday,
      starttime,
      endtime,
      comments,
      createdBy: _id,
    });
    await User.updateOne({ _id }, { $push: { tasks: result._id } });
    
    const resultStep = await Step.insertMany([...req.body.steps]);
    await Task.updateOne(
      { _id: result._id },
      { $push: { steps: resultStep._id } }
    );
    
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Task creation failed." });
  }
});
//get listar tarefas do dia
router.get("/tasks/:date", isAuthenticated, async (req, res) => {
  try {
    const { date } = req.params;
    const result = await Task.find({ date: { $eq: date } });

    if (!result) {
      return res
        .status(404)
        .json({ msg: "There is no tasks in that date yet" });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Action failed." });
  }
});

//get para detalhes da tarefa
router.get("/task/:_id", isAuthenticated, async (req, res) => {
  try {
    const { _id } = req.params;
    const result = await Task.findOne({ _id }).populate("steps");

    if (!result) {
      return res.status(404).json({ msg: "Task not found." });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Action failed." });
  }
});
//patch editar tarefas
router.patch(
  "/task/:_id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { _id } = req.params;

      const result = await Task.findOneAndUpdate(
        { _id, createdBy: req.user._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!result) {
        return res.status(404).json({ msg: "Task not found." });
      }

      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Action failed." });
    }
  }
);
//delete apagar tarefas
router.delete(
  "/task/:_id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { _id } = req.params;

      const result = await Task.findOneAndDelete({
        _id,
        createdBy: req.user._id,
      });

      await Step.deleteMany({ taskid: _id });

      return res.status(200).json({});
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Internal server error." });
    }
  }
);

module.exports = router;
