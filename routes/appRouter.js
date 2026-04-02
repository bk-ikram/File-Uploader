const { Router } = require('express');
const appRouter = Router();
const appController = require("../controllers/appController");
const { signupValidation
        ,folderValidation
 } = require("../middleware/validation");
const { isAuth } = require('../middleware/authMiddleware');
const multer = require("multer");
const upload = multer({ dest: 'uploads/'});

//universal
appRouter.use((req, res, next) => {
    if (req.user) res.locals.user = req.user;
    next();
})

//homepage
appRouter.get("/",appController.appGet);

//signup
appRouter.get("/signup",appController.signupGet);

appRouter.post("/signup"
                ,signupValidation
                ,appController.signupPost);

//login

appRouter.get("/login",appController.loginGet);

appRouter.post("/login"
                ,appController.loginPost);


//logout
appRouter.get("/logout", appController.logoutGet);


//folder get
//appRouter.get("/folder", isAuth, appController.folderGet);
appRouter.get("/folder{/:folderid}", isAuth, appController.folderGet);

//folder create post
appRouter.post("/folder{/:folderid}/create"
                ,isAuth
                ,folderValidation
                ,appController.folderCreatePost);

//folder delete post
appRouter.post("/folder/:folderid/delete"
                ,isAuth
                ,appController.folderDeletePost);

//file upload post
appRouter.post("/folder{/:folderid}/upload"
                ,isAuth
                ,upload.single('uploaded_file')
                ,appController.fileUploadPost);

//file delete post
appRouter.post("/file/:fileid/delete"
                ,isAuth
                ,appController.fileDeletePost);

appRouter.get("/file/:fileid/download"
                ,isAuth
                ,appController.fileDownloadGet
)

module.exports = appRouter;