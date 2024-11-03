import { digestModel } from "../models/digest.js";
import { commons } from "../static/message.js";

const digest = async (req, res, next) => {
  const { email } = req.body;

  // Validate the email parameter
  if (!email) {
    return res.status(406).json({
      message: commons.invalid_params,
      format: "email",
    });
  }

  try {
    // Check if the email is already subscribed
    const currentEmail = await digestModel.findOne({ email });
    if (currentEmail) {
      return res.status(409).json({ message: "Already subscribed." });
    }

    // Create a new subscription entry
    const newEmail = new digestModel({ email });
    await newEmail.save(); // Await the save operation
  } catch (err) {
    console.error("Error occurred:", err); // Log error for debugging
    return res
      .status(500)
      .json({ message: "Error occurred, try again later." });
  }

  // Successful subscription response
  return res.status(200).json({ message: "Subscribed successfully." });
};

export { digest as digestController };
