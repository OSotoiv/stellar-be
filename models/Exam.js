const db = require("../db");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
    ExpressError,
} = require("../expressError");

class Exam {
    static async creatNew(title, description, grade_level) {
        const result = await db.query(
            `INSERT INTO math_exam
            (title, description, grade_level)
            VALUES ($1, $2, $3)
            RETURNING id;`,
            [title, description, grade_level]
        )
        const { id } = result.rows[0];
        if (id) {
            await this.autoFillLeaders(id);
            return id;
        }
        throw new ExpressError()
    }
    static async autoFillLeaders(id) {
        const result = await db.query(
            `INSERT INTO leaders
            (username, exam_score, exam_time, exam_id)
          VALUES
            ('user1', 1, 1000, $1),
            ('user2', 1, 1000, $1),
            ('user3', 1, 1000, $1),
            ('user4', 1, 1000, $1),
            ('user5', 1, 1000, $1),
            ('user6', 1, 1000, $1),
            ('user7', 1, 1000, $1),
            ('user8', 1, 1000, $1),
            ('user9', 1, 1000, $1),
            ('user10', 1, 1000, $1)
            RETURNING *;`, [id]
        )

        if (!result.rows[0]) throw new ExpressError()
        return;
    }

    static async addQuestion(examID, examData) {
        const {
            setup_text = null,
            image_url_1 = null,
            image_url_2 = null,
            question_text = null,
            option_a_text = null,
            option_a_image_url = null,
            option_b_text = null,
            option_b_image_url = null,
            option_c_text = null,
            option_c_image_url = null,
            option_d_text = null,
            option_d_image_url = null,
            correct_answer = null,
            grade_level = 0, // Default value, you can adjust as needed
        } = examData;

        const result = await db.query(
            `INSERT INTO exam_questions
            (setup_text, image_url_1, image_url_2, question_text, option_a_text,
                option_a_image_url, option_b_text, option_b_image_url, option_c_text, option_c_image_url,
                option_d_text, option_d_image_url, correct_answer, grade_level, math_exam_id)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id`,
            [
                setup_text, image_url_1, image_url_2, question_text, option_a_text,
                option_a_image_url, option_b_text, option_b_image_url, option_c_text, option_c_image_url,
                option_d_text, option_d_image_url, correct_answer, grade_level, examID
            ]
        );
        if (result.rows[0]) {
            const { id: questionId } = result.rows[0];
            const mathTestQuestionId = await Exam.connectQuestionToTest(examID, questionId);
            return mathTestQuestionId;
        }
        throw new ExpressError()
    }

    static async connectQuestionToTest(examId, questionId) {
        const result = await db.query(
            `INSERT INTO math_exam_questions
            (math_exam_id, question_id)
            VALUES($1, $2)
            RETURNING id`,
            [examId, questionId]);
        const { id } = result.rows[0];
        if (!id) throw new ExpressError()
        return id;
    }

    static async viewExam(examId) {
        const titleResult = await db.query(
            `SELECT id, title, description, grade_level FROM math_exam WHERE math_exam.id = $1`,
            [examId]);

        if (!titleResult.rows[0]) throw new NotFoundError();

        const { id, title, description, grade_level } = titleResult.rows[0];
        const examResult = await db.query(
            `SELECT eq.*
            FROM exam_questions eq
            JOIN math_exam_questions meq ON eq.id = meq.question_id
            JOIN math_exam me ON me.id = meq.math_exam_id
            WHERE meq.math_exam_id = $1;`,
            [examId]);
        if (!examResult.rows[0]) throw new NotFoundError();

        const questions = examResult.rows.map((q) => {
            const options = [
                { text: q.option_a_text, image_url: q.option_a_image_url },
                { text: q.option_b_text, image_url: q.option_b_image_url },
                { text: q.option_c_text, image_url: q.option_c_image_url },
                { text: q.option_d_text, image_url: q.option_d_image_url },
            ]
            delete q.option_a_text;
            delete q.option_a_image_url;
            delete q.option_b_text;
            delete q.option_b_image_url;
            delete q.option_c_text;
            delete q.option_c_image_url;
            delete q.option_d_text;
            delete q.option_d_image_url;
            return { ...q, options }
        })

        return { id, title, description, questions };
    }

    static async all() {
        const result = await db.query(
            `SELECT id, title, description, grade_level
            FROM math_exam;`)
        if (result.rows[0]) {
            return result.rows;
        }
        throw new NotFoundError('no exams found')
    }
}

module.exports = Exam;