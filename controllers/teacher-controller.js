const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');

// const teacherRegister = async (req, res) => {
//     const {teacherId, name, email, password, role, school, teachSubject, teachSclass } = req.body;
//     try {
//         // Check if teacherId already exists
//         const existingTeacherById = await Teacher.findOne({ teacherId });
//         if (existingTeacherById) {
//             return res.send({ message: 'Teacher ID already exists' });
//         }

//         const existingTeacherByEmail = await Teacher.findOne({ email });
//         if (existingTeacherByEmail) {
//             return res.send({ message: 'Email already exists' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPass = await bcrypt.hash(password, salt);

//         const teacher = new Teacher({ 
//             teacherId, 
//             name, 
//             email, 
//             password: hashedPass, 
//             role, 
//             school, 
//             teachSubject, 
//             teachSclass 
//         });

//         let result = await teacher.save();
//         await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
//         result.password = undefined;
//         res.send(result);
//     } catch (err) {
//         res.status(500).json(err);
//     }
// };
const generateTeacherId = async () => {
    const currentYear = new Date().getFullYear();
    const prefix = `TCH-${currentYear}-`;
    
    const lastTeacher = await Teacher.findOne({ teacherId: new RegExp(`^${prefix}`) })
        .sort({ teacherId: -1 })
        .limit(1);
    
    let sequence = 1;
    if (lastTeacher) {
        const lastSequence = parseInt(lastTeacher.teacherId.split('-')[2]);
        sequence = lastSequence + 1;
    }
    
    return `${prefix}${sequence.toString().padStart(3, '0')}`;
};


const teacherRegister = async (req, res) => {
    const { teacherId, name, email, password, role, school, teachSubject, teachSclass } = req.body;
    
    try {
        // Check for existing teacherId and email in parallel
        const [existingTeacherById, existingTeacherByEmail] = await Promise.all([
            Teacher.findOne({ teacherId }),
            Teacher.findOne({ email })
        ]);

        const errors = {};
        if (existingTeacherById) errors.teacherId = "Teacher ID already exists";
        if (existingTeacherByEmail) errors.email = "Email already exists";

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ 
                success: false,
                errors 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const teacher = new Teacher({ 
            teacherId, 
            name, 
            email, 
            password: hashedPass, 
            role, 
            school, 
            teachSubject, 
            teachSclass 
        });

        const result = await teacher.save();
        await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
        
        res.status(201).json({
            success: true,
            teacher: {
                ...result._doc,
                password: undefined
            }
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Server error occurred",
            error: err.message 
        });
    }
};

const teacherLogIn = async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.body.email });
        if (teacher) {
            const validated = await bcrypt.compare(req.body.password, teacher.password);
            if (validated) {
                teacher = await teacher.populate("teachSubject", "subName sessions")
                teacher = await teacher.populate("school", "schoolName")
                teacher = await teacher.populate("teachSclass", "sclassName")
                teacher.password = undefined;
                res.send(teacher);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find({ school: req.params.id })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");
        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                return { ...teacher._doc, password: undefined };
            });
            res.send(modifiedTeachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        let teacher = await Teacher.findById(req.params.id)
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName")
        if (teacher) {
            teacher.password = undefined;
            res.send(teacher);
        }
        else {
            res.send({ message: "No teacher found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { teachSubject },
            { new: true }
        );

        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });

        res.send(updatedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        await Subject.updateOne(
            { teacher: deletedTeacher._id, teacher: { $exists: true } },
            { $unset: { teacher: 1 } }
        );

        res.send(deletedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ school: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ school: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ sclassName: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;

    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.send({ message: 'Teacher not found' });
        }

        const existingAttendance = teacher.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            teacher.attendance.push({ date, status });
        }

        const result = await teacher.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error)
    }
};

module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    updateTeacherSubject,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance
};