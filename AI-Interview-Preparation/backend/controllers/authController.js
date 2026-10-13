
const User = require('../models/User');
const crypto = require('crypto');

// Helper: Normalize email addresses
const normalizeEmail = (email) => {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
};

// Helper: Send JWT token and safe user details
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  return res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);

    // Validate input
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      !email ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create user
    // The User model should hash the password before saving.
    const user = await User.create({
      name: name.trim(),
      email,
      password
    });

    return sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register error:', error);

    // Handle duplicate email race conditions
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || typeof password !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email and password'
      });
    }

    // Explicitly select password if the schema excludes it by default
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Uses the matchPassword method defined in your User model
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // authMiddleware must set req.user using the verified JWT
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User associated with this token was not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve current user'
    });
  }
};

// @desc    Redirect user to GitHub OAuth
// @route   GET /api/auth/github
// @access  Public
exports.githubAuth = (req, res) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const backendUrl =
      process.env.BACKEND_URL || 'http://localhost:5000';

    if (!clientId) {
      return res.status(500).send('GitHub OAuth is not configured');
    }

    const redirectUri = `${backendUrl}/api/auth/github/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      scope: 'user:email',
      redirect_uri: redirectUri
    });

    return res.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`
    );
  } catch (error) {
    console.error('GitHub OAuth start error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to start GitHub authentication'
    });
  }
};

// @desc    GitHub OAuth callback
// @route   GET /api/auth/github/callback
// @access  Public
exports.githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send('GitHub authorization code is missing');
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const backendUrl =
      process.env.BACKEND_URL || 'http://localhost:5000';
    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!clientId || !clientSecret) {
      return res.status(500).send('GitHub OAuth is not configured');
    }

    const redirectUri = `${backendUrl}/api/auth/github/callback`;

    // Exchange authorization code for an access token
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri
        })
      }
    );

    const tokenJson = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenJson.access_token) {
      console.error('GitHub token exchange failed:', tokenJson);

      return res.status(401).send(
        'Unable to authenticate with GitHub'
      );
    }

    const accessToken = tokenJson.access_token;

    // Fetch GitHub profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!userResponse.ok) {
      return res.status(401).send('Unable to retrieve GitHub profile');
    }

    const githubUser = await userResponse.json();

    // Retrieve verified email if the profile email is private
    let email = normalizeEmail(githubUser.email);

    if (!email) {
      const emailsResponse = await fetch(
        'https://api.github.com/user/emails',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json'
          }
        }
      );

      if (!emailsResponse.ok) {
        return res.status(400).send(
          'Unable to retrieve your GitHub email'
        );
      }

      const emails = await emailsResponse.json();

      const primaryVerifiedEmail = Array.isArray(emails)
        ? emails.find((item) => item.primary && item.verified)
        : null;

      const verifiedEmail =
        primaryVerifiedEmail ||
        (Array.isArray(emails)
          ? emails.find((item) => item.verified)
          : null);

      email = normalizeEmail(verifiedEmail?.email);
    }

    if (!email) {
      return res.status(400).send(
        'No verified email was available from GitHub'
      );
    }

    // Find the existing account or create one
    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString('hex');

      user = await User.create({
        name: githubUser.name || githubUser.login || 'GitHub User',
        email,
        password: randomPassword
      });
    }

    // Issue the same application's JWT used by email/password login
    const token = user.getSignedJwtToken();

    // Avoid embedding the token in inline JavaScript.
    // A URL fragment is not sent to the server in the HTTP request.
    const safeFrontendUrl = new URL(frontendUrl);

    if (
      safeFrontendUrl.protocol !== 'http:' &&
      safeFrontendUrl.protocol !== 'https:'
    ) {
      return res.status(500).send('Invalid frontend URL configuration');
    }

    const destination = new URL('/auth/callback', safeFrontendUrl);
    destination.hash = new URLSearchParams({ token }).toString();

    return res.redirect(destination.toString());
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);

    return res.status(500).send(
      'GitHub authentication failed. Please try again.'
    );
  }
};