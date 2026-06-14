const User = require('../models/User');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

// @desc    Redirect to GitHub for OAuth
// @route   GET /api/auth/github
// @access  Public
exports.githubAuth = (req, res) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email&redirect_uri=${encodeURIComponent(redirectUri)}&allow_signup=true`;
    return res.redirect(url);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    GitHub OAuth callback
// @route   GET /api/auth/github/callback
// @access  Public
exports.githubCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ success: false, message: 'No code returned from GitHub' });

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`
      })
    });

    const tokenJson = await tokenResponse.json();
    const accessToken = tokenJson.access_token;
    if (!accessToken) return res.status(400).json({ success: false, message: 'Failed to obtain access token', detail: tokenJson });

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}`, Accept: 'application/vnd.github+json' }
    });
    const githubUser = await userResponse.json();

    let email = githubUser.email;
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${accessToken}`, Accept: 'application/vnd.github+json' }
      });
      const emails = await emailsRes.json();
      const primary = Array.isArray(emails) && (emails.find((e) => e.primary) || emails[0]);
      email = primary?.email;
    }

    if (!email) return res.status(400).json({ success: false, message: 'No email available from GitHub' });

    let user = await User.findOne({ email });
    if (!user) {
      const randomPass = crypto.randomBytes(20).toString('hex');
      user = await User.create({ name: githubUser.name || githubUser.login, email, password: randomPass });
    }

    const token = user.getSignedJwtToken();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Send a small HTML payload that stores the token in localStorage and redirects the user
    return res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Signing in...</title></head><body><script>try{localStorage.setItem('token','${token}');window.location='${frontendUrl}/dashboard';}catch(e){window.location='${frontendUrl}';}</script></body></html>`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
