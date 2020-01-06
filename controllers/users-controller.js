const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "MERN isUser",
    email: "test@test.com",
    password: "testing"
  }
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed, check the data", 422);
  }
  const { name, email, password } = req.body;

  const hasUser = DUMMY_USERS.find(u => u.email === email);

  if (hasUser) {
    throw new HttpError("Could not create user, user already exist", 422);
  }

  const createdUser = {
    id: uuid(),
    name,
    email,
    password
  };

  DUMMY_USERS.push(createdUser);
  res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  const identifyUser = DUMMY_USERS.find(u => u.email === email);
  if (!identifyUser || identifyUser.password !== password) {
    throw new HttpError("Oops wrong credential , user not found", 401);
  }

  res.json({ message: "Logged In" });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
