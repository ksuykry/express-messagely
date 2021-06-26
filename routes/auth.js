"use strict";

const Router = require("express").Router;
const { SECRET_KEY } = require("../config.js");

const { UnauthorizedError } = require("../expressError");
const User = require("../models/user");

const jwt = require("jsonwebtoken");

const router = new Router();





/** POST /login: {username, password} => {token} */

router.post("/login", async function (req, res, next) {
    try {
      let { username, password } = req.body;
      if (await User.authenticate(username, password)) {
        let token = jwt.sign({ username }, SECRET_KEY);
        User.updateLoginTimestamp(username);
        return res.json({ token });
      } else {
        throw new UnauthorizedError("Invalid username/password");
      }
    } catch (err) {
      return next(err);
    }
  });

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post("/register", async function (req, res, next) {
    try {
      let { username } = await User.register(req.body);
      let token = jwt.sign({ username }, SECRET_KEY);
      User.updateLoginTimestamp(username);
      return res.json({ token });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;