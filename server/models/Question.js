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
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  answer1: {
    type: String,
    required: true,
    trim: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  answer2: {
    type: String,
    required: true,
    trim: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  answer3: {
    type: String,
    required: true,
    trim: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  answer4: {
    type: String,
    required: true,
    trim: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  correctAnswer: {
    type: String,
    required: true,
    trim: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// RETURN ACCOUNT DATA
QuestionSchema.statics.toAPI = (doc) => ({
  question: doc.question,
  answer1: doc.answer1,
  answer2: doc.answer2,
  answer3: doc.answer3,
  answer4: doc.answer4,
  correctAnswer: doc.correctAnswer,
});


// RETURNS ACCOUNT WHOS USERNAME MATCHES NAME ARGUMENT
QuestionSchema.statics.findByQuestion = (q, callback) => {
  const search = {
    question: q,
  };

  return QuestionModel.findOne(search, callback);
};

QuestionModel = mongoose.model('Question', QuestionSchema);

module.exports.QuestionModel = QuestionModel;
module.exports.QuestionSchema = QuestionSchema;
