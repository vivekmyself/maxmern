//const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

const User = require("../models/user");

// const DUMMY_USERS = [
//   {
//     id: "u1",
//     name: "MERN isUser",
//     email: "test@test.com",
//     password: "testing"
//   }
// ];

const getUsers = async (req, res, next) => {
  // res.json({ users: DUMMY_USERS });
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError("User not found", 500);
    return next(error);
  }

  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, check the data", 422));
  }
  const { name, email, password } = req.body;

  // const hasUser = DUMMY_USERS.find(u => u.email === email);
  // if (hasUser) {
  //   throw new HttpError("Could not create user, user already exist", 422);
  // }
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Something went wrong, couldnot sign up", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User Exist already, do login", 422);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvJIvT7ux5ZSwFalNrwWyMi3nDJPZvcL5sauBl6qNA4Q8dEcte&s",
    places: []
  });

  //DUMMY_USERS.push(createdUser);
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Sign up failed, try again", 500);
    return next(error);
  }
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  // const identifyUser = DUMMY_USERS.find(u => u.email === email);
  // if (!identifyUser || identifyUser.password !== password) {
  //   return next( new HttpError("Oops wrong credential , user not found", 401));
  // }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Something went wrong, couldnot login", 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError("Credential wrong, couldnot login", 500);
    return next(error);
  }

  res.json({ message: "Logged In" });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
