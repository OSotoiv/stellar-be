"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
    /** authenticate user with username, password.
     *
     * Returns { username, first_name, last_name, email, is_admin }
     *
     * Throws UnauthorizedError is user not found or wrong password.
     **/

    static async authenticate(username, password) {
        // try to find the user first
        const result = await db.query(
            `SELECT username,
                  password,
                  is_admin
           FROM users
           WHERE username = $1`,
            [username],
        );

        const user = result.rows[0];

        if (user) {
            // compare hashed password to a new hash from password
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true) {
                delete user.password;
                return user;
            }
        }

        throw new UnauthorizedError("Invalid username/password");
    }

    /** Register user with data.
     *
     * Returns { username, firstName, lastName, email, isAdmin }
     *
     * Throws BadRequestError on duplicates.
     **/

    static async register({ username, password }) {
        const duplicateCheck = await User.userExist(username);

        if (duplicateCheck) {
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `INSERT INTO users
           (username,
            password)
           VALUES ($1, $2)
           RETURNING username, is_admin`,
            [
                username,
                hashedPassword
            ],
        );

        const user = result.rows[0];

        return user;
    }
    static async userExist(username) {
        const user = await db.query(
            `SELECT username
            FROM users
            WHERE username = $1`,
            [username]
        );
        if (user.rows[0]) {
            return true;
        } else {
            return false;
        }

    }

}


module.exports = User;