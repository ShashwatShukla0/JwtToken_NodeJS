require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

const app = express();

app.use(express.json());

//import user content
const User = require("./model/user");

//register
app.post("/register", async (req, res) => {
  try {
    //get input
    const { fname, lname, email, password } = req.body;

    //validate input
    if (!(email && password && fname && lname)) {
      res.status(400).send("All inputs are required");
    }

    //Validate if user already exist
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User already exist");
    }

    //encrypt password
    encryptedPassword = await bcrypt.hash(password, 10);

    //Create user in db
    const user = await User.create({
      fname,
      lname,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    //Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    //save token
    user.token = token;

    //return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

//login
app.post("/login", async (req, res) => {
  try {
    //get user input
    const { email, password } = req.body;

    //validate user input
    if (!(email && password)) {
      res.status(400).send("All input required");
    }

    //validate if user exist in db
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      //create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      //save token
      user.token = token;

      //user
      res.status(200).json(user);
    }

    res.status(400).send("Invalid Creds");
  } catch (err) {
    console.log(err);
  }
});

app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome !!");
});

module.exports = app;
