import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    minEducation: {
      type: String,
      required: true,
    },
    minExperience: {
      type: Number,
      required: true,
    },
    closingDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "Closed", "Processing"],
      default: "Open",
    },
    cvCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "createJobs",
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
