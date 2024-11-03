import * as dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import fs from "fs/promises";
import { VerifyRoute } from "./routes/verify.js";
import { DigestRoutes } from "./routes/digest.js";
import { router as contactRoutes } from "./routes/contact.js";
import { router as imageRoutes } from "./routes/image.js";
import { router as userRoutes } from "./routes/users.js";
import { userAttemptsModel } from "./models/user_attempts.js";

// Log environment variables to ensure they are loaded
console.log(process.env);

const app = express();
const swaggerDocument = JSON.parse(
  await fs.readFile(new URL("./swagger.json", import.meta.url))
);

app.use(cors());
app.use(bodyParser.json());

app.use("/api/verify", VerifyRoute);
app.use("/api/user/", userRoutes);
app.use("/api/image/", imageRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/contact", contactRoutes);
app.use("/api/digest", DigestRoutes);

// MongoDB connection URI
const mongoURI = `mongodb+srv://admin:admin123@graphical-password-db.ujpsj.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set("strictQuery", true);
mongoose
  .connect(mongoURI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}...`);
    });
  })
  .catch((err) => console.log("MongoDB connection error:", err));

// Fetch current attempts and update
const currentAttempts = await userAttemptsModel.findOne({
  email: "test@gmail.com",
});
if (currentAttempts) {
  userAttemptsModel
    .findOneAndUpdate(
      { email: "test@gmail.com" },
      { attempts: currentAttempts.attempts + 1 },
      { new: true } // This will return the updated document
    )
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
} else {
  console.log("No current attempts found for this email.");
}

// Example of finding a user by username
await userAttemptsModel.findOne({ username: "test" });

// Create and save new user attempts
const testAttempts = new userAttemptsModel({
  username: "test2",
  email: "test2@gmail.com",
  attempts: 0,
});

testAttempts
  .save()
  .then((res) => console.log("New user attempts saved:", res))
  .catch((err) => console.log(err));

// Assuming transporter is defined elsewhere
transporter.sendMail(mailOptions, function (err, info) {
  if (err) console.log(err);
  else console.log("Email Sent: " + info.response);
});

// Unsplash photo search example (assuming unsplash is defined and configured)
const result = unsplash.search
  .getPhotos({
    query: "cats",
    perPage: 64,
    orientation: "squarish",
  })
  .then((result) => console.log(result.response.results))
  .catch((err) => console.log("Unsplash search error:", err));
