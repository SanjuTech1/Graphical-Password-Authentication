// checkController.js
import { usertModel as User } from "../models/user.js";
import { commons, validation_messages as msg } from "../static/message.js";

const check = async (req, res, next) => {
  let user;
  var { username, email } = req.query;

  if (typeof username === "undefined" && typeof email === "undefined") {
    return res.status(400).json({
      message: commons.invalid_params,
      format: "username or email",
    });
  }

  try {
    if (typeof email === "undefined") {
      username = username.toLowerCase();
      user = await User.findOne({ username });
    } else {
      user = await User.findOne({ email });
    }

    return res.status(200).json({ exists: !!user });
  } catch (err) {
    return res.status(400).json({ message: msg.search_err });
  }
};

export { check };
