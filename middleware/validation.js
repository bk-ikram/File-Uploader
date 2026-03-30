const { body } = require("express-validator");
require('dotenv').config();

const emptyMsg = "cannot be empty";
const lengthMsg = "should be between 5 and 30 characters";

module.exports.signupValidation = [
    body("firstname")
        .trim()
        .notEmpty()
        .withMessage("First name " + emptyMsg)
        .isLength({min: 5, max: 30})
        .withMessage("First name " + lengthMsg),
    body("lastname")
        .trim()
        .notEmpty()
        .withMessage("Last name " + emptyMsg)
        .isLength({min: 5, max: 30})
        .withMessage("Last name " + lengthMsg),
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username " + emptyMsg)
        .isLength({min: 4, max: 30})
        .withMessage("Username " + lengthMsg),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password " + emptyMsg)
        .isLength({min: 5, max: 30})
        .withMessage("Password " + lengthMsg),
    body("conf-password").custom((value, { req }) => {
        console.log("form body is ",JSON.stringify(req.body));
        console.log(value, req.body.password);
        if (value !== req.body.password) throw new Error("Password did not match");
        return true;
    }),
];
