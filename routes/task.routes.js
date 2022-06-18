const parse = require("date-fns/parse");

const router = require("express").Router();

const Task = require("../models/Task.model");
const User = require("../models/User.model");
const Step = require("../models/Step.model");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

//Post para criar tarefas
router.post("/task", isAuthenticated, attachCurrentUser, async (req, res) => {
  try {
    const { name, field, date, starttime, endtime, comments } = req.body;
    const splitStartTime = starttime.split(":");
    const splitEndTime = endtime.split(":");

    const startdate = parse(`${date} ${starttime}`, 'yyyy-MM-dd HH:mm', new Date())

    const enddate = parse(`${date} ${endtime}`, 'yyyy-MM-dd HH:mm', new Date())
   
    const { _id } = req.user;
    const result = await Task.create({
      name,
      field,
      startdate,
      enddate,
      comments,
      createdBy: _id,
    });
    await User.updateOne({ _id }, { $push: { tasks: result._id } });

    const resultStep = await Step.insertMany(
      [...req.body.steps].map((currentEl) => {
        return { description: currentEl.value, taskid: result._id };
      })
    );

    console.log(resultStep);

    await Task.updateOne(
      { _id: result._id },
      {
        $push: {
          steps: {
            $each: resultStep.map((currentEl) => {
              return currentEl._id;
            }),
          },
        },
      }
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
    const { _id } = req.user;

    const result = await Task.find({
      startdate: {$gte: new Date(date)},
      createdBy: _id,
    }).sort({startdate:1}).populate("steps");
    console.log(date);
    if (!result) {
      return res
        .status(404)
        .json({ msg: "There is no tasks in that date yet" });
    }
    console.log(result);
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
      //deletemany para limpar os steps ja criados na tarefa
      await Step.deleteMany({ taskid: _id });
      //insertmany para criar os steps novamente e adicionar os novos
      const resultStep = await Step.insertMany(
        [...req.body.steps].map((currentEl) => {
          return { description: currentEl.value, taskid: _id };
        })
      );
      const { name, field, date, weekday, starttime, endtime, comments, done } =
        req.body;
      const result = await Task.findOneAndUpdate(
        { _id, createdBy: req.user._id },
        {
          $set: {
            name: name,
            comments: comments,
            field: field,
            date: date,
            wekday: weekday,
            starttime: starttime,
            endtime: endtime,
            done: done,
          },

          $push: {
            steps: {
              $each: resultStep.map((currentEl) => {
                return currentEl._id;
              }),
            },
          },
        },
        { new: true, runValidators: true }
      );

      if (!result) {
        return res.status(404).json({ msg: "Task not found." });
      }

      return res.status(200).json("result");
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Action failed." });
    }
  }
);
//rota para endtask
router.patch(
  "/task/endtask/:_id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { _id } = req.params;
      const result = await Task.updateOne(
        { _id, createdBy: req.user._id },
        { $set: { done: req.body.done } },
        { new: true, runValidators: true }
      );
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
