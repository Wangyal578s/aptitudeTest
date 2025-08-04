const {User} = require('../models');
const {Admin} = require('../models');

const verifyEmail = async (req, res) => {
  const token = req.query.token;

  if (!token) {
    req.session.error = 'Verification token missing.';
    return res.redirect('/login');
  }

  try {
    // Try finding user/admin by token
    let account = await User.findOne({ where: { verificationToken: token } });

    if (!account) {
      account = await Admin.findOne({ where: { verificationToken: token } });
    }

    if (!account) {
      req.session.error = 'Invalid or expired verification token.';
      return res.redirect('/login');
    }

    if (account.isVerified) {
      req.session.success = 'Your email is already verified. Please log in.';
      return res.redirect('/login');
    }

    account.isVerified = true;
    account.verificationToken = null;
    await account.save();

    req.session.success = 'Email verified successfully! You may now log in.';
    res.redirect('/login');
  } catch (err) {
    console.error('Verification error:', err);
    req.session.error = 'Something went wrong during verification.';
    res.redirect('/login');
  }
};

module.exports = { verifyEmail };
