const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) { //NOTES.md #002
    console.assert(user.is_admin !== undefined,
        "createToken passed user without isAdmin property");

    let payload = {
        username: user.username,
        isAdmin: user.is_admin || false
    };

    return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };