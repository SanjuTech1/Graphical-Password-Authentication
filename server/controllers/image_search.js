import { nanoid } from "nanoid";
import { commons } from "../static/message.js";
import { shuffleArray, unsplash } from "../util/util.js";

const search = async (req, res, next) => {
  const { keyword } = req.query;
  const pages = 3; // Number of pages to fetch
  const images = [];
  const splitArrays = [];

  if (!keyword) {
    return res.status(400).json({
      // Use 400 for bad requests
      message: commons.invalid_params,
      format: "keyword",
    });
  }

  try {
    // Use Promise.all to fetch all pages concurrently
    const results = await Promise.all(
      Array.from({ length: pages }, (_, i) =>
        unsplash.search.getPhotos({
          query: keyword,
          perPage: 30,
          orientation: "landscape",
          page: i + 1, // Pass the page number
        })
      )
    );

    results.forEach((result) => {
      const resultsArray = result.response.results;
      resultsArray.forEach((each) => {
        images.push({
          id: nanoid(),
          url: each.urls.small,
        });
      });
    });
  } catch (err) {
    console.error("Error fetching images:", err); // More descriptive error logging
    return res
      .status(500)
      .json({ message: "Error occurred while fetching images." });
  }

  // Shuffle the images
  shuffleArray(images);

  // Split images into arrays of 16
  for (let i = 0; i < images.length; i += 16) {
    splitArrays.push(images.slice(i, i + 16));
  }

  return res.status(200).json(splitArrays); // Send the split arrays as JSON
};

export { search };
