const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/auth");
const JWT_SECRET = "iNoteBook";



//Route:1 Create a User using: POST "/api/auth/createuser". Doesn't require Auth . No Login required
router.post(
  "/registration-user",
  [
    body("username", "Username must be atleast 3 characters").isLength({
      min: 3,
    }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 8 characters").isLength({
      min: 8,
    }),
    body("confirmPassword", "Password not same Confirm Password").custom(
      (value, { req }) => {
        return value === req.body.password;
      }
    ),
  ],
  async (req, res) => {
    try {
    // If there are errors, return Bad request and the errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {username, email, password } =req.body;
      // Check whether the user with this email exists already
      let user = await User.findOne({ email: email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      user = await User.create({
        username: username,
        email: email,
        password: secPass,
      })
        .then((user) => {
          const data = {
            user: { id: user.id },
          };
          const authtoken = jwt.sign(data, JWT_SECRET);
          
          res.status(200).json({ authtoken });
        })
        .catch((error) => {
          res.json({ message: error.message });
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);



// Route:2 Authenticate a User using: POST "api/auth/login-user". No login required
router.post(
  "/login-user",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password can not be blank").exists()
  ],
  async (req, res) => {
    try {

    // if there are error, return Bad request and the error
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } =req.body;
      // Check whether the user with this email exists already
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }
      const data = {
        user: { id: user.id },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.status(200).json({ authtoken });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);


// Route:3 get loginuser details using: GET "api/auth/get-user". Login required
router.get("/get-user",fetchuser, async(req, res)=> {
  try{
    const userId=req.user.id;
    const user = await User.findById(userId).select('-password');
    res.status(200).send(user)

  }catch(error){
    console.log(eroor)
    res.status(500).send('Internal Server Error');
  }

})
module.exports = router;
