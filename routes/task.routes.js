const router = require("express").Router();

const Task = require("../models/Task.model");
const User = require("../models/User.model");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

//Post para criar tarefas
router.post("/task", isAuthenticated, attachCurrentUser, async (req, res) => {
  try {
    const data = req.body;
    const { _id } = req.user;
    const result = await Task.create({ ...data, createdBy: _id });
    await User.updateOne({ _id }, { $push: { tasks: result._id } });
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Task creation failed." });
  }
});
//get listar tarefas
router.get(
  "/task/:date",
  isAuthenticated,
  attachCurrentUser,
  async (req, res) => {
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
  }
);
//get para detalhes da tarefa
//patch editar tarefas
//delete apagar tarefas

module.exports = router;
