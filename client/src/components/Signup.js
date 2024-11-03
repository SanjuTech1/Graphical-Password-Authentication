import { useEffect, useState } from "react";
import PasswordIcon from "./Items/PasswordIcon"; // Custom component for password icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import validator from "validator";
import axios from "axios";
import { successToast, Toast } from "../util/toast";
import { checkEmail, checkUsername } from "../util/validation";
import { Page } from "../util/config";
import { api } from "../static/config";
import { getNameByNumber } from "../util/util";
import { nanoid } from "nanoid";

export default function Signup(props) {
  const [next, setNext] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [imageData, setImageData] = useState([]);
  const [signupInfo, setSignupInfo] = useState({
    username: "",
    email: "",
    password: "",
    pattern: ["", "", "", ""],
    sets: [[]],
  });

  // Handle input changes for form fields
  function handleChange(event) {
    setSignupInfo((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  }

  // Reset pattern and set new image data
  useEffect(() => {
    setSignupInfo((prev) => ({
      ...prev,
      sets: imageData,
      pattern: ["", "", "", ""],
    }));
  }, [imageData]);

  // Render password icons based on current iteration
  function getIcons() {
    return imageData[iteration]?.map((image) => (
      <PasswordIcon
        iteration={iteration}
        id={image.id}
        key={nanoid()}
        src={image.url}
        selected={image.id === signupInfo.pattern[iteration]}
        onClick={handleImageClick}
      />
    ));
  }

  // Handle image selection
  function handleImageClick(id, iter) {
    const newPattern = [...signupInfo.pattern];
    newPattern[iter] = id;
    setSignupInfo((prev) => ({
      ...prev,
      pattern: newPattern,
    }));
  }

  // Create account function
  function createAccount() {
    if (signupInfo.pattern[iteration] === "") {
      Toast("Select an image first!");
      return;
    }
    if (iteration < 3) {
      setIteration(iteration + 1);
      return;
    }
    if (signupInfo.pattern.length < 4) {
      Toast("Choose all 4 images!");
      return;
    }
    props.setLoading(true);
    axios
      .post(`${api.url}/api/user/signup`, signupInfo)
      .then((res) => {
        props.setLoading(false);
        props.setUserInfo({
          email: res.data.email,
          username: res.data.username,
        });
        props.setLoggedIn(true);
        successToast("Logged In!");
        props.setPage(Page.HOME_PAGE);
      })
      .catch((err) => {
        console.log(err);
        props.setLoading(false);
        Toast(err.response?.data?.message || "Signup failed");
      });
  }

  // Validate data before proceeding to graphical password setup
  function validateData() {
    if (signupInfo.username.trim().length < 1) {
      Toast("Invalid username!");
      return false;
    } else if (!validator.isEmail(signupInfo.email)) {
      Toast("Invalid email address!");
      return false;
    } else if (signupInfo.password.length < 8) {
      Toast("Password must be at least 8 characters");
      return false;
    }
    return true;
  }

  // Check if username and email are already taken
  async function validateUsernameAndEmail() {
    const isEmailExist = await checkEmail(signupInfo.email, props.setLoading);
    const isUsernameExists = await checkUsername(
      signupInfo.username,
      props.setLoading
    );

    if (isUsernameExists) Toast("Username already exists!");
    else if (isEmailExist) Toast("Email already exists!");

    return !isEmailExist && !isUsernameExists;
  }

  // Handle "Next" button click
  async function handleNextClick() {
    if (validateData() && (await validateUsernameAndEmail())) {
      setNext(true);
    }
  }

  // Search for images based on a keyword
  function searchKeyword() {
    if (keyword.trim() === "") {
      Toast("Invalid keyword!");
      return;
    }
    props.setLoading(true);
    axios
      .get(`${api.url}/api/image/search?keyword=${keyword}`)
      .then((data) => {
        props.setLoading(false);
        setImageData(data.data);
      })
      .catch((err) => {
        console.log(err);
        props.setLoading(false);
        Toast(err.response?.data?.message || "Image search failed");
      });
  }

  // Determine button title based on iteration state
  function getButtonTitle() {
    return iteration < 3 ? "Next" : "Create Account";
  }

  // Handle "Back" button click
  function handleBackClick() {
    if (iteration === 0) setNext(false);
    else setIteration(iteration - 1);
  }

  return (
    <div className=" sm:h-[38rem] mt-12">
      {!next && (
        <div className="flex justify-center h-full">
          <div className="hidden sm:block">
            <img
              className="transition duration-500 ease-in-out hover:scale-95 h-full"
              alt=""
              src="../static/img/signup.png"
            />
          </div>
          <div className="font-['Work_Sans'] mt-4">
            <p className="px-4 sm:px-0 text-white text-3xl sm:text-5xl sm:font-bold">
              Create Account
            </p>
            <p className="text-white text-lg sm:text-2xl px-4 sm:px-0">
              Welcome! Enter Your Details And Experience
            </p>
            <p className="text-white text-lg sm:text-2xl px-4 sm:px-0">
              Graphical Password System.
            </p>
            <div className="flex flex-col w-[80%] sm:w-2/3 px-4 sm:px-0">
              <input
                value={signupInfo.username}
                onChange={handleChange}
                name="username"
                className="rounded-full h-8 sm:h-12 px-6"
                type="text"
                placeholder="Username"
              />
              <input
                value={signupInfo.email}
                onChange={handleChange}
                name="email"
                className="rounded-full h-8 sm:h-12 px-6 mt-4"
                type="email"
                placeholder="Email"
              />
              <input
                value={signupInfo.password}
                onChange={handleChange}
                name="password"
                className="rounded-full h-8 sm:h-12 px-6 mt-4"
                type="password"
                placeholder="Password"
              />
            </div>
            <button
              onClick={handleNextClick}
              className="transition duration-500 ease-in-out h-8 sm:h-12 bg-[#A259FF] rounded-full px-6 sm:w-2/3 mt-6 text-white border-2 hover:bg-transparent border-[#A259FF] font-bold"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {next && (
        <div className="sm:flex h-full">
          {imageData.length > 0 && (
            <div className="hidden sm:grid grid-cols-4 bg-[#3B3B3B] h-full rounded-lg w-[75%] justify-items-center py-4 px-2 gap-2 ml-12">
              {getIcons()}
            </div>
          )}
          {imageData.length === 0 && (
            <div className="text-2xl text-white hidden sm:flex justify-center items-center h-full bg-[#3B3B3B] w-[75%] ml-12 rounded-lg">
              <p className="bg-red-600 px-3 py-1 rounded-lg">No Images :(</p>
            </div>
          )}

          <div className="hidden sm:block font-['Work_Sans'] mt-4 ml-12">
            <p className="text-white text-5xl font-bold">
              Set Graphical Password
            </p>
            <p className="text-white text-2xl">Enter keyword to get images.</p>
            <p className="text-white text-2xl">
              Select{" "}
              <span className="text-green-400">
                {getNameByNumber(iteration + 1)}
              </span>{" "}
              Image.
            </p>
            {iteration === 0 && (
              <div className="align-middle items-center">
                <p className="text-white text-2xl">Type Keyword: </p>
                <div className=" rounded-lg flex mt-2">
                  <input
                    onChange={(event) => setKeyword(event.target.value)}
                    value={keyword}
                    placeholder="Enter a keyword"
                    type="text"
                    className="p-2 rounded-l-lg"
                  />
                  <button
                    onClick={searchKeyword}
                    className="h-[3rem] bg-[#A259FF] px-6 rounded-r-lg"
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="text-white"
                    ></FontAwesomeIcon>
                  </button>
                </div>
              </div>
            )}
            <div className="mt-8">
              <button
                onClick={handleBackClick}
                className="transition duration-500 ease-in-out h-12 bg-[#A259FF] rounded-full px-6 sm:w-2/3 mt-6 text-white border-2 hover:bg-transparent border-[#A259FF] font-bold"
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  className="mr-2"
                ></FontAwesomeIcon>
                Back
              </button>
              <button
                onClick={createAccount}
                className="transition duration-500 ease-in-out h-12 bg-[#A259FF] rounded-full px-6 sm:w-2/3 mt-6 text-white border-2 hover:bg-transparent border-[#A259FF] font-bold ml-6"
              >
                {getButtonTitle()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// useEffect(function() {
//     const newPattern = signupInfo.pattern;
//     for(let i=0; i<iconsData.length; i++) {
//         const icon = iconsData[i];
//         if (icon.selected && (!newPattern.includes(icon.id))) {
//             newPattern.push(icon.id)
//         }
//         else if (newPattern.includes(icon.id) && !icon.selected){
//             removeElementFromArray(icon.id, newPattern)
//         }
//     }
//     setSignupInfo(prev => {
//         return {
//             ...prev,
//             "pattern": newPattern
//         }
//     })
// }, [iconsData])
