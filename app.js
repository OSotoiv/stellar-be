"use strict";
const express = require("express");
const cors = require("cors");
const { authenticateJWT } = require("./middleware/auth");
const { NotFoundError } = require("./expressError");
const authRoutes = require("./routes/auth");
// const usersRoutes = require("./routes/users");
const examRoutes = require("./routes/exam");

const app = express();
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next()
})
app.use(cors({
    origin: 'http://localhost:3000' // update with your domain and port
}));
app.use(express.json());
app.use(authenticateJWT);

app.get('/', (req, res) => {
    res.json('Hello, World!');
});

app.use("/auth", authRoutes);
app.use("/exam", examRoutes);
// app.use("/users", usersRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    // if (process.env.NODE_ENV !== "test") console.error(err.stack);
    // console.error(err.stack)
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app;