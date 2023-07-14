"use strict";

const express = require("express");
const router = new express.Router();
const { BadRequestError } = require("../expressError");
const { isAdmin } = require("../middleware/auth");
const Exam = require("../models/Exam")

router.use(isAdmin)
/**route accepts a title for a new exam and retuns the id of the exam to be used for adding exam questions */
router.post("/create", async (req, res, next) => {
    try {
        const { title } = req.body;
        const id = await Exam.creatNew(title);
        res.json({ id, title })
    } catch (e) {
        return next(e)
    }
})
/**route uses the exam id to add a exam question to that exam. */
router.post("/:id", async (req, res, next) => {
    try {
        const mathTestQuestionsId = await Exam.addQuestion(req.params.id, req.body);
        return res.json({ mathTestQuestionsId })
    } catch (e) {
        return next(e)
    }
})
router.get("/view/:testId", async (req, res, next) => {
    const { testId } = req.params
    const testData = await Exam.viewTest(testId);
    return res.json({ testId, testData });
})
router.get("/all/:username", async (req, res, next) => {
    const allTest = await Exam.all(req.params.username);
    return res.json({ allTest })
})
module.exports = router;