require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("./config/db.config")();

const app = express();

app.use(express.json());
app.use(morgan("dev"));
// Não esquecer de criar variável de ambiente com o endereço do seu app React (local ou deployado no Netlify)
app.use(cors({ origin: process.env.REACT_APP_URL }));

const userRouter = require("./routes/user.routes");
const taskRouter = require("./routes/task.routes");
const stepRouter = require("./routes/step.routes");

app.use("/", userRouter);
app.use("/", taskRouter);
app.use("/", stepRouter);

app.listen(Number(process.env.PORT), () =>
  console.log(`Server up and running at port ${process.env.PORT}`)
);
