const db = require("../db");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

class Exam {
    static async creatNew(title) {
        const result = await db.query(
            `INSERT INTO math_exam
            (title)
            VALUES ($1)
            RETURNING id;`,
            [title]
        )
        const { id } = result.rows[0];
        return id;
    }

    static async addQuestion(examID, examData) {
        const { setup_text,
            question_text,
            option_a_text,
            option_a_image_url,
            option_b_text,
            option_b_image_url,
            option_c_text,
            option_c_image_url,
            option_d_text,
            option_d_image_url,
            correct_answer,
            image_url_1,
            image_url_2 } = examData;
        const result = await db.query(
            `INSERT INTO exam_questions
            (setup_text, image_url_1, image_url_2, question_text, option_a_text,
                option_a_image_url, option_b_text, option_b_image_url, option_c_text, option_c_image_url,
                 option_d_text, option_d_image_url, correct_answer, math_exam_id)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id`,
            [setup_text, image_url_1, image_url_2, question_text, option_a_text,
                option_a_image_url, option_b_text, option_b_image_url, option_c_text, option_c_image_url,
                option_d_text, option_d_image_url, correct_answer, examID]);

        const { id: questionId } = result.rows[0];
        const mathTestQuestionsId = await Exam.connectQuestionToTest(examID, questionId);
        return mathTestQuestionsId;
    }
    static async connectQuestionToTest(examId, questionId) {
        const result = await db.query(
            `INSERT INTO math_exam_questions
            (math_exam_id, question_id)
            VALUES($1, $2)
            RETURNING id`,
            [examId, questionId]);
        const { id } = result.rows[0];
        return id;
    }
    static async viewExam(examId) {
        const result = await db.query(
            `SELECT eq.*, me.title
            FROM exam_questions eq
            JOIN math_exam_questions meq ON eq.id = meq.question_id
            JOIN math_exam me ON me.id = meq.math_exam_id
            WHERE meq.math_exam_id = $1;`,
            [examId])
        return result.rows;
    }
    static async all() {
        const result = await db.query(
            `SELECT math_exam.id, math_exam.title
            FROM math_exam;`)
        return result.rows;
    }
}

module.exports = Exam;