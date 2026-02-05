import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String, // "2 days ago", "1 week ago" jaisa text
      required: true,
    },
  },
  { _id: false }, // optional: MongoDB ka extra _id nahi banega
);

const ToolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    pricing: {
      type: String,
      enum: ["Free", "Freemium", "Paid"],
      default: "Freemium",
    },

    category: [
      {
        type: String,
        trim: true,
      },
    ],

    whatItDoes: {
      type: String,
    },

    howToUse: [
      {
        type: String,
      },
    ],
    embedding: {
  type: [Number],
  index: "vector",
},


    techRelevance: [
      {
        type: String,
      },
    ],

    image: {
      type: String,
    },

    officialLink: {
      type: String,
    },

    docLink: {
      type: String,
      default: "N/A",
    },

    tutorialLink: {
      type: String,
      default: "N/A",
    },

    githubLink: {
      type: String,
      default: "N/A",
    },

    reviews: [reviewSchema],

    savedCount: {
  type: Number,
  default: 0
},

    // ==== Approval System ====
    isPublished: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    moderationReason: String,

    // ==== SOURCE DEFFERENTIATION ====
   addedBy: { type: String, enum: ["guest", "admin", "moderator", "user"], default: "guest" },
 userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  },
  { timestamps: true },
);

export default mongoose.model("Tool", ToolSchema);
