const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');

const getSetting = asyncHandler(async (req, res) => {
  const setting = await Settings.findOne({ key: req.params.key });
  res.json(setting || { key: req.params.key, value: null });
});

const setSetting = asyncHandler(async (req, res) => {
  const { value } = req.body;
  const setting = await Settings.findOneAndUpdate(
    { key: req.params.key },
    { value },
    { upsert: true, new: true }
  );
  res.json(setting);
});

module.exports = { getSetting, setSetting };