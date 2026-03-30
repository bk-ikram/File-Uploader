const passport = require('passport');
const LocalStrategy = require('passport-local');
const { validPassword } = require('../lib/passwordUtils');
const { 
  getUserById,
  getUserByUsername
 } = require('../repositories/queries');

async function verifyCallback(username, password, done) {
  try {
    const user = await getUserByUsername( username );
    if (!user) {
      return done(null, false, { message: 'Incorrect username or password.' }); 
    }
    const match = await validPassword(password, user.hash);
    if(!match){
      return done(null, false, { message: 'Incorrect username or password.' });
    }
    return done(null, user);
  } catch(err) {
    return done(err);
  }
  
};

const strategy = new LocalStrategy(verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById( id);

    done(null, user);
  }
  catch(err){
    done(err);
  }
});