const cors = require("cors");

const corsOptions = {
    origin: ' https://stellar-gui-fb784e53a2d2.herokuapp.com',
    optionsSuccessStatus: 200
}
// const corsOptions = {
//     origin: 'http://localhost:3000',
//     optionsSuccessStatus: 200
// }

module.exports = cors(corsOptions)