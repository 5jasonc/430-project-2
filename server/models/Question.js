const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let QuestionModel = {};

// DECLARE SCHEMA
const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  answer1: {
    type: String,
    required: true,
    trim: true,
  },
  answer2: {
    type: String,
    required: true,
    trim: true,
  },
  answer3: {
    type: String,
    required: true,
    trim: true,
  },
  answer4: {
    type: String,
    required: true,
    trim: true,
  },
  correctAnswer: {
    type: String,
    required: true,
    trim: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// RETURN QUESTION DATA
QuestionSchema.statics.toAPI = (doc) => ({
  question: doc.question,
  answer1: doc.answer1,
  answer2: doc.answer2,
  answer3: doc.answer3,
  answer4: doc.answer4,
  correctAnswer: doc.correctAnswer,
});

// RETURNS QUESTION WHOS question MATCHES q ARGUMENT
QuestionSchema.statics.findByQuestion = (q, callback) => {
  const search = {
    question: q,
  };

  return QuestionModel.findOne(search, callback);
};

// GET RANDOM QUESTION FROM DB
QuestionSchema.statics.getRandomQuestion = (callback) => {
  const query = {
    $sample: { size: 1 },
  };

  return QuestionModel.aggregate([query], callback);
};

// SAVE MODEL
QuestionModel = mongoose.model('Question', QuestionSchema);

module.exports.QuestionModel = QuestionModel;
module.exports.QuestionSchema = QuestionSchema;
