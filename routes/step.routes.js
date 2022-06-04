const router = require("express").Router();
const Task = require("../models/Task.model");
const Step = require("../models/Step.model");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
//criar step
// router.post("/step", isAuthenticated, attachCurrentUser, async (req, res) => {
//   try {
//     const { taskid } = req.body;
//     const result = await Step.create({ ...req.body });
//     await Task.updateOne({ _id: taskid }, { $push: { steps: result._id } });
//     return res.status(201).json(result);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ msg: "Step creation failed." });
//   }
// });
//atualizar estado do Step(feito ou não)
router.patch(
  "/step/:_id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { _id } = req.params;

      const result = await Step.findOneAndUpdate(
        { _id },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!result) {
        return res.status(404).json({ msg: "Step not found." });
      }

      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Action failed." });
    }
  }
);

//get steps
// router.get("/steps", isAuthenticated, async (req, res) => {
//   try {
//     const result = await Step.find();

//     return res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ msg: "Internal server error." });
//   }
// });

//deletar step
router.delete(
  "/step/:_id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { _id } = req.params;

      const result = await Step.findOneAndDelete({ _id });

      return res.status(200).json({});
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Internal server error." });
    }
  }
);

module.exports = router;
