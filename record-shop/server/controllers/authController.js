const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const {
  authError,
  duplicateFieldsHandler,
} = require('../middleware/errorHandlers');
const User = require('../models/userModel');

//! cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.addUser = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    const result = await cloudinary.uploader.upload(process.env.CLOUD_AVATAR, {
      public_id: email.split('@')[0],
    });

    user.avatarURL =
      process.env.NODE_ENV === 'development' ? result.url : result.secure_url;
    user.save();

    const token = user.generateAuthToken();

    //! cookies
    res.cookie('jwt', token, {
      expiresIn: new Date(
        Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      data: user.getPublicFields(),
    });
  } catch (error) {
    console.log('err', error);
    if (error.code === 11000) {
      return next(duplicateFieldsHandler(error.keyValue));
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.checkPassword(password, user.password))) {
      return authError('Invalid email password combination');
    }

    const token = user.generateAuthToken();

    // successHandler(res, 201, user);
    res.cookie('jwt', token, {
      expiresIn: new Date(
        Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      data: user.getPublicFields(),
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // clear cookies
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({
      message: 'success',
      statusCode: 200,
      data: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
