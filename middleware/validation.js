const { body } = require("express-validator");
require('dotenv').config();
const { 
        getchildFolders

     } = require("../repositories/queries");

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

module.exports.folderValidation = [
    body("foldername")
        .trim()
        .notEmpty()
        .withMessage("Folder name " + emptyMsg)
        .isLength({min: 5, max: 30})
        .withMessage("Folder name " + lengthMsg)//add custom validation to make sure name does not already exist in current folder.
        .custom(async (value, { req }) => {
            const folderid = req.params.folderid
            const nameInput = value.trim().lower();
            const childFolders = await getchildFolders(folderid);
            const match = childFolders.find( (existing) => existing.lower() == nameInput);
            if(match) throw new Error(`The folder ${match} already exists. Please choose a different name.`)
                return true;

        })   
];