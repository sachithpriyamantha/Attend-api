const mongoose = require("mongoose");

const noticeFileSchema = new mongoose.Schema({
    notice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'notice',
        required: true
    },
    filename: String,
    originalname: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("noticefile", noticeFileSchema);
