

// const mongoose = require("mongoose")

// const noticeSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true
//     },
//     details: {
//         type: String,
//         required: true
//     },
//     date: {
//         type: Date,
//         required: true
//     },
//     school: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'admin'
//     },
//     file: {
//         filename: String,
//         path: String,
//         mimetype: String
//     }
// }, { timestamps: true });

// module.exports = mongoose.model("notice", noticeSchema)


const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    files: [{
        filename: String,
        originalname: String,
        path: String,
        size: Number,
        mimetype: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model("notice", noticeSchema);