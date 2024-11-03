import { contactFormatModel } from "../models/contact_format.js";
import { commons } from "../static/message.js";

const contact = async (req, res, next) => {
  const { name, email, message } = req.body;

  // Validate request parameters
  if (!name || !email || !message) {
    return res.status(406).json({
      message: commons.invalid_params,
      format: "[name, email, message]",
    });
  }

  // Create a new contact format entry
  const contactFormat = new contactFormatModel({ name, email, message });

  try {
    // Save to the database
    await contactFormat.save();
  } catch (err) {
    console.error("Error saving to database:", err); // Log error for debugging
    return res
      .status(500)
      .json({ message: "Error saving to database. Please try again later." });
  }

  // Successful response
  return res
    .status(200)
    .json({ message: "Contact information saved successfully." });
};

export { contact as contactController };
