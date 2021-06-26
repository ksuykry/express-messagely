"use strict";

const Router = require("express").Router;
const router = new Router();
const Message = require("../models/message")
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const { UnauthorizedError } = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async function(req, res, next) {
    try {
      const user = res.locals.user.username;
      let message = await Message.get(req.params.id);
      if (message.to_user.username !== user && message.from_user.username !== user) {
        throw new UnauthorizedError("Error-- not authorized to view message!");
      }
      return res.json({ message })
    } catch (err) {
      return next(err);
    }
  });


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function(req, res, next){
    try{
        let message = await Message.create(req.params)
        return res.json({ message });  
    }
    catch(err){
        return next(err);
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureCorrectUser, async function(req, res, next){
    try{
        let message = await Message.markRead(req.params.id)
        return res.json({ message });  
    }
    catch(err){
        return next(err);
    }
})


module.exports = router;