const { validationResult } = require("express-validator");
const { genPassword } = require("../lib/passwordUtils");
const { 
        insertUser, 
        getUserMainFolder,
        getFolderContents,
        createFolder

     } = require("../repositories/queries");
const passport = require("passport");

exports.appGet = ( req, res) => {
    if(req.user){
        res.redirect("/folder");
    }
    else{
        return res.render("index", {
            title: "Welcome to File Uploader"
        });
    }
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

exports.folderGet = async (req, res, next) => {
    console.log("attempting to access folder");
    const userId = req.user.id;

    //get current folderid. If none supplied, then serve user's main folder.
    const folderid = req.params.folderid;
    let mainFolderid;
    if(!folderid){
        const mainFolder = await getUserMainFolder(userId);
        const mainFolderid = mainFolder.id;
    }
    //get user's main folder
    const folderContents = await getFolderContents(folderid || mainFolderid);

    
    res.render("folder", {
        title: "Your files here",
        currentUrl: req.originalUrl,
        currentFolderId: req.folderid || mainFolderid,
        folders: folderContents.folders,
        files: folderContents.files
    })

}

exports.folderCreatePost = async(req, res, next) => {
    const parentFolderId = req.body.parentFolderId;
    const userid = req.userid;
    const name = req.body.foldername;

    await createFolder( parentFolderId, userid, name );

    res.redirect(`/folder/${parentFolderId}`);

}

