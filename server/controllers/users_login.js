// loginController.js
import { usertModel as User } from "../models/user.js";
import bcrypt from "bcryptjs";
import { login_messages as msg, commons } from "../static/message.js";
import jwt from "jsonwebtoken";
import { checkArray, sendEmail } from "../util/util.js";
import { userAttemptsModel } from "../models/user_attempts.js";
import { nanoid } from "nanoid";

const login = async (req, res, next) => {
  let token;
  let existingUser;
  let isValidPassword = false;
  var isValidPattern = false;
  var { username, password, pattern } = req.body;
  username = username.toLowerCase();

  if (
    typeof username === "undefined" ||
    typeof password === "undefined" ||
    typeof pattern === "undefined"
  ) {
    return res.status(406).json({
      message: commons.invalid_params,
      format: msg.format,
    });
  }

  try {
    existingUser = await User.findOne({ username });
  } catch (err) {
    return res.status(401).json({ message: msg.db_user_failed });
  }

  if (!existingUser) {
    return res.status(401).json({ message: msg.user_not_exist });
  }

  const currentAttempts = await userAttemptsModel.findOne({ username });

  // Check if the user is blocked
  if (currentAttempts.attempts > process.env.MAX_ATTEMPTS) {
    return res
      .status(403)
      .json({
        status: "blocked",
        message: "Your account has been blocked, please check your email.",
      });
  }

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: msg.db_pass_failed });
  }

  isValidPattern = checkArray(existingUser.pattern, pattern, true);

  // Handle failed login attempts
  if (!isValidPassword || !isValidPattern) {
    await userAttemptsModel.findOneAndUpdate(
      { username },
      { attempts: currentAttempts.attempts + 1 }
    );

    if (currentAttempts.attempts + 1 === Number(process.env.MAX_ATTEMPTS)) {
      await userAttemptsModel.findOneAndUpdate(
        { username },
        { token: nanoid(32) }
      ); // Add token if needed
      sendEmail(currentAttempts.email); // Notify user
    }

    return res.status(401).json({ message: msg.invalid_credentials });
  }

  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.TOKEN_KEY
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: commons.token_failed });
  }

  // Reset attempts on successful login
  await userAttemptsModel.findOneAndUpdate({ username }, { attempts: 0 });

  return res
    .status(200)
    .json({
      username: existingUser.username,
      userId: existingUser.id,
      email: existingUser.email,
      token,
    });
};

export { login as loginController };
