const mongoose = require('mongoose');

const accidentSchema = new mongoose.Schema({
  acc_id: {
    type: String,
    required: true,
    unique: true
  },
  occr_date: {
    type: String,
    required: true
  },
  occr_time: {
    type: String,
    required: true
  },
  exp_clr_date: String,
  exp_clr_time: String,
  acc_type: String,
  acc_dtype: String,
  link_id: String,
  grs80tm_x: Number,
  grs80tm_y: Number,
  acc_info: String,
  acc_road_code: Number
});

module.exports = mongoose.model('Accident', accidentSchema);