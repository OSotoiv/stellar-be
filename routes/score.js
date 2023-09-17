"use strict";
const express = require("express");
const router = new express.Router();
const { BadRequestError } = require("../expressError");
const Score = require("../models/Score");
const scoreSchema = require("../schemas/score.json");
const jsonschema = require("jsonschema");
// const corsMiddleware = require("../middleware/corsMiddleware")
const { isAdmin } = require("../middleware/auth");

// router.use(corsMiddleware)

router.post('/', async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, scoreSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const { username, exam_score, exam_time, exam_id } = req.body;
        const user = await Score.add(username, exam_score, exam_time, exam_id);
        res.json({ user })
    } catch (e) {
        return next(e)
    }
})

router.get('/isTopTen/:exam_id', async (req, res, next) => {
    try {
        const { exam_score, exam_time } = req.query;
        const { exam_id } = req.params;
        const isTopTen = await Score.isTopTen(exam_id, parseInt(exam_score), parseInt(exam_time));
        return res.json({ isTopTen })
    } catch (e) {
        return next(e)
    }
})
router.get('/topTen/:exam_id', async (req, res, next) => {
    try {
        const { exam_id } = req.params
        const topTen = await Score.topTenByExamId(exam_id)
        return res.json({ ...topTen });
    } catch (e) {
        return next(e)
    }
})
router.get('/leaders', async (req, res, next) => {
    try {
        const leaders = await Score.allLeaders()
        return res.json({ leaders })
    } catch (e) {
        return next(e)
    }
})
module.exports = router
