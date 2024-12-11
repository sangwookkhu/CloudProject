const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuth, ensureGuest } = require('../middlewares/auth');
const AuthService = require('../services/auth');

router.get(
  '/google',
  ensureGuest,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  AuthService.handleGoogleCallback
);

router.get('/logout', ensureAuth, AuthService.logout);

module.exports = router;