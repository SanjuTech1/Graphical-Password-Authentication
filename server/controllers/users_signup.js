import { usertModel as User } from "../models/user.js";
import bcrypt from "bcryptjs";
import { commons, signup_messages as msg } from "../static/message.js";
import jwt from "jsonwebtoken";
import { userAttemptsModel } from "../models/user_attempts.js";

const signup = async (req, res, next) => {
  let token;
  let existingUser;
  let hashedPassword;
  const { username, email, password, pattern, sets } = req.body;

  // Check for missing parameters
  if (
    !username ||
    !email ||
    !password ||
    !pattern ||
    typeof sets === "undefined"
  ) {
    return res.status(406).json({
      message: commons.invalid_params,
      format: msg.format,
    });
  }

  // Convert username to lowercase
  const lowercasedUsername = username.toLowerCase();

  try {
    // Check if the username or email already exists
    existingUser = await User.findOne({
      $or: [{ username: lowercasedUsername }, { email }],
    });
  } catch (err) {
    console.log("Database user fetch error:", err);
    return res.status(500).json({ message: msg.db_user_failed });
  }

  if (existingUser) {
    return res.status(400).json({ message: msg.user_already_exist });
  }

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    console.log("Password hashing error:", err);
    return res.status(500).json({ message: msg.pass_hash_err });
  }

  const createdUser = new User({
    username: lowercasedUsername,
    email,
    password: hashedPassword,
    sets,
    pattern,
    sequence: false,
  });

  const attempts = new userAttemptsModel({
    username: lowercasedUsername,
    email,
    attempts: 0,
  });

  try {
    await createdUser.save();
    await attempts.save();
  } catch (err) {
    console.error("User save error:", err);
    return res.status(500).json({ message: msg.db_save_err });
  }

  try {
    // Log a message to indicate the token generation process has started
    console.log("Generating token for:", {
      userId: createdUser.id,
      email: createdUser.email,
    });

    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.TOKEN_KEY,
      { expiresIn: "1h" }
    );

    // Log the generated token for debugging purposes
    console.log("Generated token:", token);
  } catch (err) {
    console.log("Token generation error:", err);
    return res.status(500).json({ message: commons.token_failed });
  }

  return res.status(201).json({
    username: createdUser.username,
    userId: createdUser.id,
    email: createdUser.email,
    token,
  });
};

export { signup as signupController };
