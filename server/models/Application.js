import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    jobId: {
      type: String,
      required: true,
      ref: "Job",
    },
    applicantId: {
      type: String,
      required: true,
      ref: "User",
    },
    applicantName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    cvUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Shortlisted", "Rejected"],
      default: "Pending",
    },
    rawText: {
      type: String,
      default: ""
    },
    skills: {
      type: [String],
      default: []
    },
    education: {
      type: [String],
      default: []
    },
    roles: {
      type: [String],
      default: []
    },
    projects: {
      type: [String],
      default: []
    },
    matchScore: {
      type: Number,
      default: 0
    },
    skillsMatched: {
      type: [String],
      default: []
    },
    educationMatch: {
      type: String,
      default: ""
    },
    experienceMatch: {
      type: String,
      default: ""
    },
    explanation: {
      type: String,
      default: ""
    },
    isRecommended: {
      type: Boolean,
      default: false
    },
    emailSent: {
      type: Boolean,
      default: false
    },
    statusHistory: {
      type: [{
        status: { type: String, required: true },
        updatedBy: { type: String, default: "System" },
        updatedAt: { type: Date, default: Date.now },
        comment: { type: String, default: "" }
      }],
      default: []
    }
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({
  applicantName: "text",
  rawText: "text",
  skills: "text",
  roles: "text"
});

const Application = mongoose.model("Application", applicationSchema);

export default Application;
