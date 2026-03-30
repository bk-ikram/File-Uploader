const { validationResult } = require("express-validator");
const { genPassword } = require("../lib/passwordUtils");
const { 
        insertUser, 
        insertMessage, 
        getAllMessageDetails,
        deleteMessage,
        verifyMessageAuthor,
        grantMembership
     } = require("../repositories/queries");
const passport = require("passport");

exports.appGet = ( req, res) => {
    res.render("index", {
        title: "Welcome to File Uploader"
    });
};

exports.signupGet = ( req, res) => {
    res.render("signup", {
        title: "Welcome to File Uploader"
    });
};

exports.signupPost = async( req, res, next) => {
    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            res.errors = errors.array;
            res.render("signup",{
                title: "Registration Failed",
                errors: errors.array(),
                userInput: req.body,
            })
        }
        else {
            const { username, firstname, lastname, password } = req.body;
            //generate hashed password
            const hashedPassword = await genPassword(password);
            //need to insert user into the db
            await insertUser(username, firstname, lastname,hashedPassword);
            //render the register page again, with success value
            res.render("signup",{
                title: "Registration Successful",
                success: true,
            })
        }
    }
    catch (err) {
        next(err);
    }
};

exports.loginGet = ( req, res) => {
    res.render("login", {
        title: "Login to your Account",
        loginFailed: req.query.error === "true"
    });
};

exports.loginPost = passport.authenticate("local", {
                        successRedirect: "/",
                        failureRedirect: "/login?error=true",
                        failureMessage: true
                        });

exports.logoutGet = (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
}

exports.messageFormGet = (req, res, next) => {
  res.render("messageForm", {
        title: "New Message"
    });
}

exports.messageFormPost = async(req, res, next) => {
    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            res.errors = errors.array;
            res.render("messageForm",{
                title: "Creating Message Failed",
                errors: errors.array(),
                userInput: req.body,
            })
        }
        else {
            const { title, message } = req.body;
            const userid = req.user.userid;
            //need to insert message into the db
            await insertMessage(userid, title, message);
            //redirect to homepage
            res.redirect('/');
        }
    }
    catch (err) {
        next(err);
    }
};

exports.messageDeletePost = async(req, res, next) => {
    try{
        const messageId = req.params.messageid;
        const { userid, isAdmin} = req.user;
        const isOwner = await verifyMessageAuthor(messageId, userid);
        if(isOwner || isAdmin){
            await deleteMessage(messageId);
            res.redirect("/");
        }
        else{
            res.status(401).send("You are not allowed to perform this action.")
        }
        
    }
    catch(err){
        next(err);
    }
};



exports.becomeMemberPost = async(req, res, next) => {
    try{
        await grantMembership(req.userid);
        res.redirect("/");
        }
    catch(err){
        next(err);
    }
};