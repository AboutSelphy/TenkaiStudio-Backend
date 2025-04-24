require('dotenv').config();
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const refresh = require('passport-oauth2-refresh');
const User = require('../models/user');

const scopes = ['identify', 'email','guilds', 'guilds.join'];
const prompt = 'consent'

passport.serializeUser((user, done) => {
  done(null, user.id); // Use DB id
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const strategy = new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: scopes,
  prompt: prompt
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const [user, created] = await User.findOrCreate({
      where: { discordId: profile.id },
      defaults: {
        email: profile.email,
        accessToken,
        refreshToken,
      },
    });

    // Update tokens if needed
    if (!created) {
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
});

passport.use(strategy);
refresh.use(strategy);

module.exports = passport;
