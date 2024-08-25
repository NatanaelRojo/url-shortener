const mongoose = require('../index');
const urlSchema = require('../schemas/Url.schema');

const Url = mongoose.model('Url', urlSchema);

module.exports = Url;