"use strict";

const express = require("express");
const router = new express.Router();
const { BadRequestError } = require("../expressError");
const { isAdmin } = require("../middleware/auth");
const Exam = require("../models/Exam");
const newExamSchema = require("../schemas/newExam.json");
const jsonschema = require("jsonschema");

router.use(isAdmin)
/**route accepts a title for a new exam and retuns the id of the exam to be used for adding exam questions */
router.post("/new", async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, newExamSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const { title } = req.body;
        const id = await Exam.creatNew(title);
        res.json({ id, title })
    } catch (e) {
        return next(e)
    }
})
/**route uses the exam id to add an exam question to that exam.
 * the newly added questions id is returned
 */
router.post("/question/:id", async (req, res, next) => {
    try {
        const mathTestQuestionsId = await Exam.addQuestion(req.params.id, req.body);
        return res.json({ mathTestQuestionsId })
    } catch (e) {
        return next(e)
    }
})
/**route used to get all exam questions by exam id */
router.get("/view/:examId", async (req, res, next) => {
    const { examId } = req.params
    const examData = await Exam.viewExam(examId);
    return res.json({ examId, examData });
})
router.get("/all", async (req, res, next) => {
    const exams = await Exam.all();
    return res.json({ exams })
})
module.exports = router;