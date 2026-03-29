const passport = require('passport');
const LocalStrategy = require('passport-local');
const { validPassword } = require('../lib/passwordUtils');
const { pool } = require('../db/setup/connections');

async function verifyCallback(username, password, done) {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [ username ]);
    const user = rows[0];
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
  done(null, user.userid);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE userid = $1", [id]);
    const user = rows[0];

    done(null, user);
  }
  catch(err){
    done(err);
  }
});