const db = require("../db")
const { NotFoundError, ExpressError } = require("../expressError");

class Score {
    static async add(username, exam_score, exam_time, exam_id) {
        let id;
        const weakestUser = await db.query(
            `SELECT * FROM leaders
            WHERE exam_id = $1 AND exam_score <= $2
            ORDER BY exam_score ASC, exam_time DESC;`, [exam_id, exam_score])
        if (weakestUser.rows[0]) {
            id = weakestUser.rows[0].id;
        } else {
            throw new ExpressError('not a valid exam_score')
        }
        const removedUser = await db.query(
            `DELETE FROM leaders WHERE id = $1 RETURNING id;`, [id]
        )
        if (removedUser.rows[0].id === id) {
            const result = await db.query(
                `INSERT INTO leaders
                (username, exam_score, exam_time, exam_id)
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [username, exam_score, exam_time, exam_id])

            if (result.rows[0]) {
                return result.rows
            }
        }
        throw new ExpressError('Server Error Try again later')
    }

    static async isTopTen(exam_id, exam_score, exam_time) {
        const result = await db.query(`
        SELECT * FROM leaders
        WHERE exam_id = $1 AND exam_score <= $2
        ORDER BY exam_score ASC, exam_time DESC;`, [exam_id, exam_score]);
        let isTopTen = false;
        if (result.rows[0]) {
            for (const user of result.rows) {
                if (user.exam_score < exam_score) {
                    return true;
                } else if (user.exam_time > exam_time) {
                    return true;
                }
            }
        }
        return isTopTen;
    }
    static async topTenByExamId(exam_id) {
        const result = await db.query(
            `SELECT * FROM leaders WHERE exam_id = $1
            ORDER BY exam_score DESC, exam_time ASC;`,
            [exam_id]
        )
        return result.rows;
    }
    
    static async allLeaders() {
        const allExams = await db.query(
            `SELECT m.id AS exam_id, m.title AS exam_title
            FROM math_exam m;`
        )
        if (!allExams.rows[0]) throw new NotFoundError('Cant find the leaders!!!!')

        const leaderboard = await Promise.all(allExams.rows.map(async (exam) => {
            const leaders = await this.topTenByExamId(exam.exam_id);
            const results = { ...exam, top_ten: leaders }
            return results
        }))
        return leaderboard;
    }
}
module.exports = Score;