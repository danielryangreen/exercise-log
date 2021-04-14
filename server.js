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

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost/workout',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }
);

// add routes here
app.get("/api/workouts", (req, res) => {
  db.Workout.aggregate(
    [
      {
        '$addFields': {
          'totalDuration': {
            '$sum': '$exercises.duration'
          }
        }
      }
    ]
  )
    // .populate("exercises")
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    });
});

app.post("/api/workouts", ({ body }, res) => {
  // db.Exercise.create(body)
  //   .then(({ _id }) => db.Workout.findOneAndUpdate({}, { $push: { exercises: _id } }, { new: true }))
  db.Workout.create(body)
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    });
});

app.put("/api/workouts/:id", (req, res) => {
  db.Workout.updateOne({ _id: req.params.id }, { $push: { exercises: req.body } })
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    });
});

app.get("/api/workouts/range", (req, res) => {
  db.Workout.aggregate(
    [
      {
        '$addFields': {
          'totalDuration': {
            '$sum': '$exercises.duration'
          }
        }
      }
    ]
  ).sort({ day: -1 }).limit(7)
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
