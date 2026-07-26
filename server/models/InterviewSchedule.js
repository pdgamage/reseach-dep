import mongoose from "mongoose";

const interviewScheduleSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      ref: "Job",
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "Zoom / Online",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "scheduleInterviews",
  }
);

const InterviewSchedule = mongoose.model("InterviewSchedule", interviewScheduleSchema);

export default InterviewSchedule;
