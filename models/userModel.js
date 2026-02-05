import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    image: {
      type: String, // image URL
      default: "https://img.freepik.com/premium-vector/round-man-character-mockup-icon-flat-color-round-man-icon-blue-tshirt-brown-hair-character-template-vector-icon_774778-2418.jpg?semt=ais_hybrid&w=740&q=80",
    },

    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resources" }],


    savedTools: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tool",
      },
    ],
    favorites: [
    { type: mongoose.Schema.Types.ObjectId, ref: "AiToolsModel" }
  ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
