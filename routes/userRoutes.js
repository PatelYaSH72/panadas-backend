import express from "express";
import {
  bookmarkedData,
  dashBoradData,
  getUserData,
  sendEmail,
  toggleFavorite,
  toggleSaved,
  updateProfile,
  userSignup,
} from "../controller/userController.js";
import { loginUser } from "../controller/userController.js";
import authUser from "../middlewares/authUser.js";
import {
  addReview,
  getAiLinks,
  getAiTool,
  getAiToolsData,
} from "../controller/AiToolsController.js";
import {
  addResouceReview,
  getBookmarkedResources,
  getResourcesData,
  getResourcesToolBySlug,
  toggleBookmark,
} from "../controller/ResourcesController.js";
import { submitTool } from "../controller/ToolSubmit.controler.js";
import upload from "../middlewares/multer.js";
import { globalSearch } from "../controller/search.controller.js";
// import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post("/userSignUp", userSignup);
userRouter.post("/userLogin", loginUser);
userRouter.get("/AiTools-data", getAiToolsData);
userRouter.post("/get-AiTool", authUser, getAiTool);
userRouter.post("/add-review", authUser, addReview);
userRouter.get("/Resources-Data", getResourcesData);
userRouter.get("/resources-tool/:slug", authUser, getResourcesToolBySlug);
userRouter.post("/toggle-favorite", authUser, toggleFavorite);
userRouter.post("/toggle-save", authUser, toggleSaved);
userRouter.post( "/submit",authUser,upload.single("image"),submitTool);
userRouter.get("/dashBoradData", authUser, dashBoradData);
userRouter.put("/upate-data", authUser,upload.single("image"), updateProfile);
userRouter.post("/bookmarks", authUser, getBookmarkedResources);
userRouter.get("/user-data", authUser, getUserData);
userRouter.get("/search", globalSearch);
userRouter.post("/create", getAiLinks);
userRouter.post("/send-email", authUser, sendEmail);
userRouter.post("/addResource-review", authUser, addResouceReview);
userRouter.post("/toggle-bookmark", authUser, toggleBookmark);
userRouter.get("/bookmarks-data", authUser, bookmarkedData);

export default userRouter;
