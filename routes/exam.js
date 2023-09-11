"use strict";

const express = require("express");
const router = new express.Router();
const { BadRequestError } = require("../expressError");
const { isAdmin } = require("../middleware/auth");
const Exam = require("../models/Exam");
const newExamSchema = require("../schemas/newExam.json");
const newQuestionSchema = require("../schemas/newQuestion.json");
const jsonschema = require("jsonschema");


/**route accepts a title description and grade_level 
 * for a new exam and retuns the id of the exam to be used for adding exam questions */
router.post("/new", isAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, newExamSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const { title, description, grade_level } = req.body;
        const id = await Exam.creatNew(title, description, grade_level);
        res.json({ id, title, description, grade_level })
    } catch (e) {
        return next(e)
    }
})


/**route uses the exam id to add an exam question to that exam.
 * the newly added questions id is returned
 */
router.post("/:id/question", isAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, newQuestionSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const mathTestQuestionsId = await Exam.addQuestion(req.params.id, req.body);
        return res.json({ mathTestQuestionsId })
    } catch (e) {
        return next(e)
    }
})


/**route used to get all exam questions by exam id */
router.get("/view/:examId", async (req, res, next) => {
    try {
        const { examId } = req.params
        const { id, title, description, questions } = await Exam.viewExam(examId);
        return res.json({ exam_id: id, title, description, questions });
    } catch (e) {
        return next(e)
    }
})


router.get("/all", async (req, res, next) => {
    try {
        const exams = await Exam.all();
        return res.json({ exams })
    } catch (e) {
        return next(e)
    }
})
module.exports = router;