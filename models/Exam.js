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

    static async addQuestion(testId, testData) {
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
            image_url_2 } = testData;
        const result = await db.query(
            `INSERT INTO math_questions
            (setup_text, image_url_1, image_url_2, question_text, option_a_text,
                option_a_image_url, option_b_text, option_b_image_url, option_c_text, option_c_image_url,
                 option_d_text, option_d_image_url, correct_answer)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id`,
            [setup_text, image_url_1, image_url_2, question_text, option_a_text,
                option_a_image_url, option_b_text, option_b_image_url, option_c_text, option_c_image_url,
                option_d_text, option_d_image_url, correct_answer]);

        const { id: questionId } = result.rows[0];
        const mathTestQuestionsId = await this.connectQuestionToTest(testId, questionId);
        return mathTestQuestionsId;
    }
    static async connectQuestionToTest(testId, questionId) {
        const result = await db.query(
            `INSERT INTO math_test_questions
            (math_test_id, question_id)
            VALUES($1, $2)
            RETURNING id`,
            [testId, questionId]);
        const { id } = result.rows[0];
        return id;
    }
    static async viewTest(testId) {
        const result = await db.query(
            `SELECT mq.*, mt.name
            FROM math_questions mq
            JOIN math_test_questions mtq ON mq.id = mtq.question_id
            JOIN math_tests mt ON mt.id = mtq.math_test_id
            WHERE mtq.math_test_id = $1;`,
            [testId])
        return result.rows;
    }
    static async all(username) {
        const result = await db.query(
            `SELECT math_tests.id, math_tests.name
            FROM math_tests
            JOIN users ON math_tests.creator_id = users.username
            WHERE users.username = $1;`,
            [username])
        return result.rows;
    }
}

module.exports = Exam;