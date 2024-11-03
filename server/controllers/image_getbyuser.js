import { commons, login_messages as msg } from "../static/message.js";
import { usertModel as User } from "../models/user.js";

const getByUser = async (req, res, next) => {
  let { username } = req.query;

  if (!username) {
    return res.status(400).json({
      // Use 400 for bad requests
      message: commons.invalid_params,
      format: "username",
    });
  }

  username = username.toLowerCase(); // Normalize username to lowercase
  let existingUser;

  try {
    existingUser = await User.findOne({ username });
  } catch (err) {
    console.error("Database error:", err); // More descriptive error logging
    return res
      .status(500)
      .json({ message: "Error occurred while fetching from DB." });
  }

  if (!existingUser) {
    return res.status(404).json({ message: msg.user_not_exist }); // Use 404 for not found
  }

  return res.status(200).json(existingUser.sets); // Send the sets as JSON
};

export { getByUser };
