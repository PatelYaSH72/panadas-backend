import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    key: { type: String, required: true },
  },
  { _id: false }
);

const ResourceSchema = new mongoose.Schema(
  {
    youtube: [{ type: String }],
    documentation: [{ type: String }],
    courses: [{ type: String }],
  },
  { _id: false }
);

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

const ResiurcesFullSchema = new mongoose.Schema(
  {
    // UI
    img: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    },
    
    color: {
      type: String,
      default: "text-blue-500",
    },
    icon: {
      type: String,
      default: "Code",
    },

    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    short_description: {
      type: String,
      required: true,
    },
    detailed_description: {
      type: String,
    },

    // Meta
    rating: {
      type: Number,
      default: 4.9,
    },
    pricing: {
      type: String,
      enum: ["Free", "Freemium", "Paid"],
      default: "Free",
    },

    // Classification
    category: {
      type: [CategorySchema],
      required: true,
    },

    // Content
    key_concepts: [{ type: String }],
    whatItDoes: {
      type: String,
    },
    howToUse: [{ type: String }],

    reviews: [reviewSchema],

    bookmarksCount: {
  type: Number,
  default: 0
},


    // Learning
    learningRoadmapData: {
      type: mongoose.Schema.Types.Mixed,
    },
    detailedStepByStepLearning: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Resources
    resources: {
      type: ResourceSchema,
      default: () => ({
        youtube: [],
        documentation: [],
        courses: [],
      }),
    },

    // Admin
    isPublished: {
      type: Boolean,
      default: true,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    embedding: {
  type: [Number], // vector
  index: "vector",
}

  },
  { timestamps: true }
);

export default mongoose.model("Resources", ResiurcesFullSchema);
