const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const htmlRouter = require('./routes/html-routes.js');

const PORT = process.env.PORT || 3000;

const db = require("./models");

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

htmlRouter(app);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", { useNewUrlParser: true });

// add routes here
app.get("/api/workouts", (req, res) => {
  db.Workout.find({})
    // .populate("exercises")
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    });
});

app.post("/api/workouts", ({ body }, res) => {
  db.Exercise.create(body)
    .then(({ _id }) => db.Workout.findOneAndUpdate({}, { $push: { exercises: _id } }, { new: true }))
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    });
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
