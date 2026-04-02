const { validationResult } = require("express-validator");
const { genPassword } = require("../lib/passwordUtils");
const { 
        insertUser, 
        getUserMainFolder,
        getFolderContents,
        createFolder,
        getFolderBreadcrumbs,
        deleteFolder,
        deleteFile,
        uploadFile,
        getFile,
        getFolderFilesRec

     } = require("../repositories/queries");
const passport = require("passport");
const fs = require("fs/promises");


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
    try{
        const userId = req.user.id;

    //get current folderid. If none supplied, then serve user's main folder.
    const folderid = parseInt(req.params.folderid);
    let mainFolderid;
    if(!folderid){
        const mainFolder = await getUserMainFolder(userId);
        mainFolderid = parseInt(mainFolder.id);
    }
    //get user's main folder
    const folderContents = await getFolderContents(folderid || mainFolderid);

    const folderBreadcrumbs = await getFolderBreadcrumbs(folderid|| mainFolderid);
    const notification = req.session.flashNotification;
    delete req.session.flashNotification;
    res.render("folder", {
        title: "Your files here",
        currentUrl: req.originalUrl,
        currentFolderId: folderid || mainFolderid,
        folderType: folderid ? "subfolder" : "mainfolder",
        folders: folderContents.folders,
        files: folderContents.files,
        notification: notification,
        folderBreadcrumbs: folderBreadcrumbs,
        createFolder: req.query.createFolder === "true",
        uploadFile: req.query.uploadFile === "true",

    })
    }
    catch(err){
        next(err);
    }

}

exports.folderCreatePost = async(req, res, next) => {
    try{
        const parentFolderId = parseInt(req.body.parentFolderId);
    const userid = req.user.id;
    const name = req.body.foldername;
    const folderType = req.body.folderType;

    await createFolder( parentFolderId, userid, name );
    req.session.flashNotification = "Your new folder has been created.";
    if(folderType === 'subfolder')
        return res.redirect(`/folder/${parentFolderId}`);
    return res.redirect('/folder');
    }
    catch(err){
        next(err);
    }
    
}

exports.folderDeletePost = async(req, res, next) => {
    try{
        const folderId = parseInt(req.params.folderid);
        const userid = req.user.id;
        //would add folder owner verification here

        //find the files that need to be deleted
        const files = await getFolderFilesRec(folderId);

        //delete folders and file records from db
        await deleteFolder(folderId);

        //delete files from storage
    
        console.log("the files to be deleted are: ", files);
        for (const file of files){
            await fs.unlink(file.url);
        }

        const { parentfolderType, parentFolderId} = req.body;
        req.session.flashNotification = "The folder and its contents have been deleted";
        if(parentfolderType === 'subfolder')
            return res.redirect(`/folder/${parentFolderId}`);
        return res.redirect('/folder');
    }
    catch(err){
        next(err);
    }

}

exports.fileUploadPost = async(req, res, next) => {
    try{
        const folderId = parseInt(req.body.folderId);
        const folderType = req.body.folderType;
        const userid = req.user.id;
        const { filename, size, path, originalname, mimetype } = req.file;
        //insert file details.
        await uploadFile(userid, folderId, originalname, filename, parseInt(size), mimetype, path);
        if(folderType === 'subfolder')
            return res.redirect(`/folder/${folderId}`);
        return res.redirect('/folder');
    }
    catch(err){
        next(err);
    }
}

exports.fileDeletePost = async(req, res, next) => {
    try{
        const fileId = parseInt(req.params.fileid);
        const userid = req.user.id;
        //would add file owner verification here
        const file = await getFile(fileId);
        if (!file)
            return res.status(404).send("File not found");

        //delete file from storage
        await fs.unlink(file.url);
        //delete db record
        await deleteFile(fileId);
        const { parentfolderType, parentFolderId} = req.body;
        req.session.flashNotification = "The file has been deleted";
        if(parentfolderType === 'subfolder')
            return res.redirect(`/folder/${parentFolderId}`);
        return res.redirect('/folder');
    }
    catch(err){
        next(err);
    }
}

//fileDownloadGet
exports.fileDownloadGet = async(req, res, next) => {
    try{
        const fileid = parseInt(req.params.fileid);
        //get file.
        const file = await getFile(fileid);
        res.download(file.url, file.originalName);
    }
    catch(err){
        next(err);
    }
}