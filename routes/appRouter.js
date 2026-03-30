const { Router } = require('express');
const appRouter = Router();
const appController = require("../controllers/appController");
const { signupValidation } = require("../middleware/validation");
const { isAuth } = require('../middleware/authMiddleware');

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

module.exports = appRouter;