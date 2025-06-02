
// const Notice = require('../models/noticeSchema.js');
// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');

// // Configure multer for file storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const uploadDir = path.join(__dirname, '../uploads/notices');
//         // Create directory if it doesn't exist
//         if (!fs.existsSync(uploadDir)){
//             fs.mkdirSync(uploadDir, { recursive: true });
//         }
//         cb(null, uploadDir)
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname))
//     }
// });

// const upload = multer({ 
//     storage: storage,
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
//     fileFilter: function (req, file, cb) {
//         const allowedFileTypes = /pdf|doc|docx|txt|jpg|jpeg|png/;
//         const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
//         const mimetype = allowedFileTypes.test(file.mimetype);
        
//         if (extname && mimetype) {
//             return cb(null, true);
//         } else {
//             cb('Error: Only PDF, DOC, DOCX, TXT, JPG, JPEG, and PNG files are allowed');
//         }
//     }
// });

// const noticeCreate = async (req, res) => {
//     upload.single('file')(req, res, async (err) => {
//         if (err) {
//             return res.status(400).json({ message: err });
//         }

//         try {
//             const noticeData = {
//                 ...req.body,
//                 school: req.body.adminID,
//                 date: new Date()
//             };

//             // Add file information if a file was uploaded
//             if (req.file) {
//                 noticeData.file = {
//                     filename: req.file.filename,
//                     path: req.file.path,
//                     mimetype: req.file.mimetype
//                 };
//             }

//             const notice = new Notice(noticeData);
//             const result = await notice.save();
//             res.send(result);
//         } catch (err) {
//             res.status(500).json(err);
//         }
//     });
// };

// const noticeList = async (req, res) => {
//     try {
//         let notices = await Notice.find({ school: req.params.id })
//         if (notices.length > 0) {
//             res.send(notices)
//         } else {
//             res.send({ message: "No notices found" });
//         }
//     } catch (err) {
//         res.status(500).json(err);
//     }
// };

// const downloadNoticeFile = async (req, res) => {
//     try {
//         const notice = await Notice.findById(req.params.id);
//         if (!notice || !notice.file) {
//             return res.status(404).json({ message: "File not found" });
//         }

//         res.download(notice.file.path, notice.file.filename);
//     } catch (error) {
//         res.status(500).json(error);
//     }
// };

// const updateNotice = async (req, res) => {
//     upload.single('file')(req, res, async (err) => {
//         if (err) {
//             return res.status(400).json({ message: err });
//         }

//         try {
//             const updateData = { ...req.body };

//             // Handle file update
//             if (req.file) {
//                 // Remove old file if exists
//                 const existingNotice = await Notice.findById(req.params.id);
//                 if (existingNotice.file && existingNotice.file.path) {
//                     fs.unlink(existingNotice.file.path, (err) => {
//                         if (err) console.error("Failed to delete old file:", err);
//                     });
//                 }

//                 // Add new file information
//                 updateData.file = {
//                     filename: req.file.filename,
//                     path: req.file.path,
//                     mimetype: req.file.mimetype
//                 };
//             }

//             const result = await Notice.findByIdAndUpdate(
//                 req.params.id,
//                 { $set: updateData },
//                 { new: true }
//             );
//             res.send(result);
//         } catch (error) {
//             res.status(500).json(error);
//         }
//     });
// };

// const deleteNotice = async (req, res) => {
//     try {
//         const notice = await Notice.findById(req.params.id);
        
//         // Delete associated file if it exists
//         if (notice.file && notice.file.path) {
//             fs.unlink(notice.file.path, (err) => {
//                 if (err) console.error("Failed to delete file:", err);
//             });
//         }

//         const result = await Notice.findByIdAndDelete(req.params.id);
//         res.send(result);
//     } catch (error) {
//         res.status(500).json(error);
//     }
// };

// const deleteNotices = async (req, res) => {
//     try {
//         // Find and delete files for all notices in this school
//         const notices = await Notice.find({ school: req.params.id });
//         notices.forEach(notice => {
//             if (notice.file && notice.file.path) {
//                 fs.unlink(notice.file.path, (err) => {
//                     if (err) console.error("Failed to delete file:", err);
//                 });
//             }
//         });

//         const result = await Notice.deleteMany({ school: req.params.id });
//         if (result.deletedCount === 0) {
//             res.send({ message: "No notices found to delete" });
//         } else {
//             res.send(result);
//         }
//     } catch (error) {
//         res.status(500).json(error);
//     }
// };

// module.exports = { 
//     noticeCreate, 
//     noticeList, 
//     updateNotice, 
//     deleteNotice, 
//     deleteNotices,
//     downloadNoticeFile 
// };





const Notice = require('../models/noticeSchema.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/notices');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, JPEG, PNG, DOC, DOCX, XLS, and XLSX files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
}).array('files', 5);// Allow up to 5 files

const noticeCreate = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            // Process the uploaded files and save the notice
            const files = req.files ? req.files.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype
            })) : [];
            const notice = new Notice({
                title: req.body.title,
                details: req.body.details,
                school: req.body.adminID,
                files: files
            });
            const result = await notice.save();
            res.send(result);
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

const noticeList = async (req, res) => {
    try {
        let notices = await Notice.find({ school: req.params.id })
            .sort({ date: -1 }) // Sort by date descending
            .lean(); // Convert to plain JavaScript objects

        // Convert file paths to URLs
        notices = notices.map(notice => {
            if (notice.files && notice.files.length > 0) {
                notice.files = notice.files.map(file => {
                    return {
                        ...file,
                        url: `/uploads/notices/${file.filename}`
                    };
                });
            }
            return notice;
        });

        if (notices.length > 0) {
            res.send(notices);
        } else {
            res.send({ message: "No notices found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};



const updateNotice = async (req, res) => {
    try {
        const result = await Notice.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteNotice = async (req, res) => {
    try {
        const result = await Notice.findByIdAndDelete(req.params.id)
        res.send(result)
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteNotices = async (req, res) => {
    try {
        const result = await Notice.deleteMany({ school: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No notices found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

// Add this to serve the files
const getNoticeFile = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../uploads/notices', req.params.filename);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).json({ message: "File not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Update other functions (updateNotice, deleteNotice, deleteNotices) as before
// ... (keep the existing implementations)

module.exports = { 
    noticeCreate, 
    noticeList, 
    updateNotice, 
    deleteNotice, 
    deleteNotices,
    getNoticeFile 
};