import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Job from "./models/Job.js";
import Application from "./models/Application.js";
import InterviewSchedule from "./models/InterviewSchedule.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import https from "https";
import { spawn } from "child_process";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://pasindu1028:Pasindu1!@cluster0.awofywi.mongodb.net/cv";
const JWT_SECRET = process.env.JWT_SECRET || "smarthire_jwt_secret_token_key_123";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "users.json");
const JOBS_FILE = path.join(__dirname, "jobs.json");
const APPLICATIONS_FILE = path.join(__dirname, "applications.json");
const SCHEDULES_FILE = path.join(__dirname, "schedules.json");

function readApplications() {
  if (!fs.existsSync(APPLICATIONS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(APPLICATIONS_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}

function writeApplications(applications) {
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2), "utf-8");
}

function readSchedules() {
  if (!fs.existsSync(SCHEDULES_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(SCHEDULES_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}

function writeSchedules(schedules) {
  fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedules, null, 2), "utf-8");
}

// Configure Cloudinary if credentials are provided in env
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Ensure local uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Write dummy mock files so they exist
const createDummyMockFile = (name) => {
  const filePath = path.join(uploadDir, name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "Mock Resume Content. This is a dummy CV for testing purposes.", "utf-8");
  }
};
createDummyMockFile("mock_cv1.pdf");
createDummyMockFile("mock_cv2.pdf");
createDummyMockFile("mock_cv3.pdf");

// Multer memory storage config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPEG, and PNG files are allowed."));
    }
  }
});

// Mock applications to seed
const initialApplications = [
  {
    _id: "cv1",
    jobId: "j3",
    applicantId: "a1",
    applicantName: "Kasun Perera",
    fileName: "Kasun_Perera_CV.pdf",
    cvUrl: "/api/uploads/mock_cv1.pdf",
    status: "Shortlisted",
    matchScore: 85,
    skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "JavaScript", "HTML"],
    roles: ["Software Engineer", "Frontend Developer", "Web Developer"],
    rawText: "Kasun Perera Software Engineer Frontend Developer proficient in React, TypeScript, Node.js, JavaScript, and CSS.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    statusHistory: [
      {
        status: "Shortlisted",
        updatedBy: "AI Pipeline",
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Application analyzed successfully. Match score: 85%."
      }
    ]
  },
  {
    _id: "cv2",
    jobId: "j3",
    applicantId: "a2",
    applicantName: "Amandi Silva",
    fileName: "Amandi_Resume_2023.pdf",
    cvUrl: "/api/uploads/mock_cv2.pdf",
    status: "Shortlisted",
    matchScore: 78,
    skills: ["Figma", "UI/UX", "Adobe XD", "Wireframing", "Prototyping", "User Research"],
    roles: ["UI/UX Designer", "Product Designer", "UX Architect"],
    rawText: "Amandi Silva UI/UX Designer Product Designer experienced in Figma, Adobe XD, Wireframing, and User Centered Design.",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    statusHistory: [
      {
        status: "Shortlisted",
        updatedBy: "AI Pipeline",
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Application analyzed successfully. Match score: 78%."
      }
    ]
  },
  {
    _id: "cv3",
    jobId: "j3",
    applicantId: "a3",
    applicantName: "Nuwan Fernando",
    fileName: "NuwanF_CV.pdf",
    cvUrl: "/api/uploads/mock_cv3.pdf",
    status: "Pending",
    matchScore: 62,
    skills: ["Python", "SQL", "Data Analysis", "Pandas", "PostgreSQL"],
    roles: ["Data Analyst", "Data Engineer", "Backend Developer"],
    rawText: "Nuwan Fernando Data Analyst Data Engineer skilled in Python, SQL, PostgreSQL, Data Analysis, and Pandas.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    statusHistory: [
      {
        status: "Pending",
        updatedBy: "System",
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Application submitted (mock seed)."
      }
    ]
  }
];

// Seed default applications (MongoDB)
async function seedApplications() {
  try {
    const appCount = await Application.countDocuments();
    if (appCount === 0) {
      console.log("No applications found in MongoDB. Seeding initial applications...");
      await Application.insertMany(initialApplications);
      console.log("Initial applications seeded successfully!");
    }
  } catch (error) {
    console.error("Error seeding applications:", error);
  }
}

// Seed default applications (Local JSON)
function seedApplicationsLocal() {
  try {
    const apps = readApplications();
    if (apps.length === 0) {
      console.log("No applications found in local DB. Seeding initial applications...");
      writeApplications(initialApplications);
      console.log("Initial applications seeded successfully in local DB!");
    }
  } catch (error) {
    console.error("Error seeding applications locally:", error);
  }
}

let useLocalDb = false;

// Local JSON Database Helpers
function readUsers() {
  if (!fs.existsSync(DB_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), "utf-8");
}

function readJobs() {
  if (!fs.existsSync(JOBS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(JOBS_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}

function writeJobs(jobs) {
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), "utf-8");
}

// MongoDB Connection with timeout
mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 })
  .then(async () => {
    console.log("Connected to MongoDB successfully");
    await seedHR();
    await seedJobs();
    await seedApplications();
  })
  .catch(async (err) => {
    console.warn("\n⚠️ MongoDB connection failed. Falling back to local file database (users.json)!");
    useLocalDb = true;
    await seedHRLocal();
    seedJobsLocal();
    seedApplicationsLocal();
  });

// Seed default HR account (MongoDB)
async function seedHR() {
  try {
    const hrExists = await User.findOne({ role: "hr" });
    if (!hrExists) {
      console.log("No HR account found. Seeding default HR account...");
      const hashedPassword = await bcrypt.hash("hrpassword123", 10);
      const defaultHR = new User({
        name: "HR Manager",
        email: "hr@smarthire.com",
        password: hashedPassword,
        role: "hr",
      });
      await defaultHR.save();
      console.log("Default HR account seeded successfully!");
      console.log("Email: hr@smarthire.com | Password: hrpassword123");
    } else {
      console.log("HR accounts already exist. Seeding skipped.");
    }
  } catch (error) {
    console.error("Error seeding HR account:", error);
  }
}

// Seed default HR account (Local JSON)
async function seedHRLocal() {
  try {
    const users = readUsers();
    const hrExists = users.some((u) => u.role === "hr");
    if (!hrExists) {
      console.log("No HR account found. Seeding default HR account in local DB...");
      const hashedPassword = await bcrypt.hash("hrpassword123", 10);
      const defaultHR = {
        _id: new mongoose.Types.ObjectId().toString(),
        name: "HR Manager",
        email: "hr@smarthire.com",
        password: hashedPassword,
        role: "hr",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(defaultHR);
      writeUsers(users);
      console.log("Default HR account seeded successfully in local DB!");
      console.log("Email: hr@smarthire.com | Password: hrpassword123");
    } else {
      console.log("HR accounts already exist in local DB. Seeding skipped.");
    }
  } catch (error) {
    console.error("Error seeding HR account locally:", error);
  }
}

// Initial Mock Jobs Data for Seeding
const initialJobs = [
  {
    _id: "j1",
    title: "Software Engineer",
    description: "We are looking for a skilled Software Engineer to join our core development team. You will be responsible for building scalable web applications and collaborating with cross-functional teams.",
    skills: ["React", "Node.js", "TypeScript", "SQL"],
    minEducation: "Bachelor's Degree",
    minExperience: 2,
    closingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Open",
    cvCount: 12
  },
  {
    _id: "j2",
    title: "Marketing Executive",
    description: "Join our dynamic marketing team to drive brand awareness and execute digital campaigns across various platforms.",
    skills: ["Digital Marketing", "SEO", "Content Creation", "Communication"],
    minEducation: "Diploma",
    minExperience: 1,
    closingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Open",
    cvCount: 8
  },
  {
    _id: "j3",
    title: "Accounts Officer",
    description: "Seeking a detail-oriented Accounts Officer to manage daily financial transactions, payroll, and reporting.",
    skills: ["Excel", "Accounting", "QuickBooks", "Attention to Detail"],
    minEducation: "Bachelor's Degree",
    minExperience: 3,
    closingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Processing",
    cvCount: 24
  },
  {
    _id: "j4",
    title: "Data Analyst",
    description: "Looking for a Data Analyst to interpret data and turn it into information which can offer ways to improve a business.",
    skills: ["Python", "SQL", "Tableau", "Statistics"],
    minEducation: "Bachelor's Degree",
    minExperience: 2,
    closingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Closed",
    cvCount: 45
  },
  {
    _id: "j5",
    title: "HR Coordinator",
    description: "We need an HR Coordinator to facilitate daily HR functions like keeping track of employees records and supporting the interview process.",
    skills: ["Communication", "Teamwork", "MS Office", "Organization"],
    minEducation: "Diploma",
    minExperience: 1,
    closingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Open",
    cvCount: 3
  }
];

async function seedJobs() {
  try {
    const jobCount = await Job.countDocuments();
    if (jobCount === 0) {
      console.log("No jobs found in MongoDB. Seeding initial jobs...");
      await Job.insertMany(initialJobs);
      console.log("Initial jobs seeded successfully!");
    } else {
      console.log("Jobs already exist in MongoDB. Seeding skipped.");
    }
  } catch (error) {
    console.error("Error seeding jobs:", error);
  }
}

function seedJobsLocal() {
  try {
    const jobs = readJobs();
    if (jobs.length === 0) {
      console.log("No jobs found in local DB. Seeding initial jobs...");
      writeJobs(initialJobs);
      console.log("Initial jobs seeded successfully in local DB!");
    } else {
      console.log("Jobs already exist in local DB. Seeding skipped.");
    }
  } catch (error) {
    console.error("Error seeding jobs locally:", error);
  }
}

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (useLocalDb) {
      const users = readUsers();
      const user = users.find((u) => u._id === decoded.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// API Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const name = `${firstName.trim()} ${lastName.trim()}`;
    const emailLower = email.toLowerCase().trim();

    if (useLocalDb) {
      const users = readUsers();
      const existingUser = users.find((u) => u.email === emailLower);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        email: emailLower,
        password: hashedPassword,
        role: "applicant",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(newUser);
      writeUsers(users);
      return res.status(201).json({ message: "User registered successfully" });
    }

    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email: emailLower,
      password: hashedPassword,
      role: "applicant",
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const emailLower = email.toLowerCase().trim();
    let user;

    if (useLocalDb) {
      const users = readUsers();
      user = users.find((u) => u.email === emailLower);
    } else {
      user = await User.findOne({ email: emailLower });
    }

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const userId = useLocalDb ? user._id : user._id.toString();
    const token = jwt.sign({ id: userId, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        authProvider: user.authProvider || "local",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const { token, credential } = req.body;
    const idToken = token || credential;

    if (!idToken) {
      return res.status(400).json({ message: "Google token is required" });
    }

    let payload;
    try {
      if (GOOGLE_CLIENT_ID) {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } else {
        const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (!tokenRes.ok) {
          throw new Error("Invalid token");
        }
        payload = await tokenRes.json();
      }
    } catch (verifyErr) {
      try {
        const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (tokenRes.ok) {
          payload = await tokenRes.json();
        } else {
          return res.status(400).json({ message: "Invalid Google token" });
        }
      } catch (err) {
        return res.status(400).json({ message: "Invalid Google token" });
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Google authentication failed: Email missing" });
    }

    const emailLower = payload.email.toLowerCase().trim();
    const name = payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim() || "Applicant User";
    const googleId = payload.sub;
    const avatar = payload.picture || "";

    let user;

    if (useLocalDb) {
      const users = readUsers();
      user = users.find((u) => u.email === emailLower);

      if (user) {
        if (user.role === "hr") {
          return res.status(403).json({
            message: "Google authentication is only available for Applicants. HR users must sign in with email and password.",
          });
        }
        user.googleId = googleId;
        user.avatar = avatar || user.avatar;
        user.authProvider = "google";
        user.updatedAt = new Date().toISOString();
        writeUsers(users);
      } else {
        user = {
          _id: new mongoose.Types.ObjectId().toString(),
          name,
          email: emailLower,
          role: "applicant",
          googleId,
          avatar,
          authProvider: "google",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        users.push(user);
        writeUsers(users);
      }
    } else {
      user = await User.findOne({ email: emailLower });

      if (user) {
        if (user.role === "hr") {
          return res.status(403).json({
            message: "Google authentication is only available for Applicants. HR users must sign in with email and password.",
          });
        }
        user.googleId = googleId;
        user.avatar = avatar || user.avatar;
        user.authProvider = "google";
        await user.save();
      } else {
        user = new User({
          name,
          email: emailLower,
          role: "applicant",
          googleId,
          avatar,
          authProvider: "google",
        });
        await user.save();
      }
    }

    const userId = useLocalDb ? user._id : user._id.toString();
    const jwtToken = jwt.sign({ id: userId, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token: jwtToken,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider || "google",
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Server error during Google authentication" });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const userId = useLocalDb ? req.user._id : req.user._id.toString();
    res.json({
      user: {
        id: userId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar || "",
        authProvider: req.user.authProvider || "local",
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error fetching user profile" });
  }
});

// Job API Routes
app.get("/api/jobs", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    if (useLocalDb) {
      const jobs = readJobs();
      let modified = false;
      const updatedJobs = jobs.map((j) => {
        if (j.status === "Open" && new Date(j.closingDate) < now) {
          j.status = "Processing";
          j.updatedAt = now.toISOString();
          modified = true;
        }
        return j;
      });
      if (modified) {
        writeJobs(updatedJobs);
      }
      const mapped = updatedJobs.map((j) => ({ ...j, id: j._id }));
      return res.json(mapped);
    }

    const jobs = await Job.find({});
    const mapped = [];
    for (let j of jobs) {
      if (j.status === "Open" && new Date(j.closingDate) < now) {
        j.status = "Processing";
        await j.save();
      }
      const obj = j.toObject();
      obj.id = obj._id;
      mapped.push(obj);
    }
    res.json(mapped);
  } catch (error) {
    console.error("Fetch jobs error:", error);
    res.status(500).json({ message: "Server error fetching jobs" });
  }
});

// Dashboard stats route to retrieve counts directly from database/local DB (HR access only)
app.get("/api/dashboard/stats", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied." });
    }

    if (useLocalDb) {
      const jobs = readJobs();
      const applications = readApplications();

      const totalJobs = jobs.length;
      const openJobs = jobs.filter(j => j.status === "Open").length;
      const totalCVs = applications.length;
      const shortlisted = applications.filter(app => app.status === "Shortlisted").length;

      return res.json({ totalJobs, openJobs, totalCVs, shortlisted });
    }

    const totalJobs = await Job.countDocuments({});
    const openJobs = await Job.countDocuments({ status: "Open" });
    const totalCVs = await Application.countDocuments({});
    const shortlisted = await Application.countDocuments({ status: "Shortlisted" });

    res.json({ totalJobs, openJobs, totalCVs, shortlisted });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
});

app.get("/api/jobs/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (useLocalDb) {
      const jobs = readJobs();
      const job = jobs.find((j) => j._id === id);
      if (!job) return res.status(404).json({ message: "Job not found" });
      return res.json({ ...job, id: job._id });
    }
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    const obj = job.toObject();
    obj.id = obj._id;
    res.json(obj);
  } catch (error) {
    console.error("Fetch job detail error:", error);
    res.status(500).json({ message: "Server error fetching job details" });
  }
});

app.post("/api/jobs", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied. Only HR can create jobs." });
    }
    const { title, description, skills, minEducation, minExperience, closingDate } = req.body;
    if (!title || !description || !minEducation || minExperience === undefined || !closingDate) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const jobData = {
      title,
      description,
      skills: skills || [],
      minEducation,
      minExperience: Number(minExperience),
      closingDate,
      status: "Open",
      cvCount: 0,
    };
    if (useLocalDb) {
      const jobs = readJobs();
      const newJob = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...jobData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      jobs.push(newJob);
      writeJobs(jobs);
      return res.status(201).json({ ...newJob, id: newJob._id });
    }
    const newJob = new Job(jobData);
    await newJob.save();
    const obj = newJob.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ message: "Server error creating job" });
  }
});

// Serve local uploads statically
app.use("/api/uploads", express.static(uploadDir));

// Apply to a job (File Upload to Cloudinary or Local Fallback)
app.post("/api/jobs/:id/apply", authMiddleware, upload.single("cv"), async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user._id || req.user.id;
    const userName = req.user.name;

    if (!req.file) {
      return res.status(400).json({ message: "No CV file uploaded" });
    }

    let cvUrl = "";
    const fileName = req.file.originalname;

    // Check if Cloudinary is configured
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        cvUrl = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "smarthire_cvs",
              resource_type: "raw",
              public_id: `cv_${jobId}_${userId}_${Date.now()}`,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        console.log("Uploaded CV to Cloudinary successfully:", cvUrl);
      } catch (cloudinaryErr) {
        console.error("Cloudinary upload failed, falling back to local storage:", cloudinaryErr);
        // Fallback to local storage if Cloudinary fails
        const localFileName = `cv_${jobId}_${userId}_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const localFilePath = path.join(uploadDir, localFileName);
        fs.writeFileSync(localFilePath, req.file.buffer);
        cvUrl = `/api/uploads/${localFileName}`;
      }
    } else {
      // Use local storage
      const localFileName = `cv_${jobId}_${userId}_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const localFilePath = path.join(uploadDir, localFileName);
      fs.writeFileSync(localFilePath, req.file.buffer);
      cvUrl = `/api/uploads/${localFileName}`;
      console.log("Saved CV to local storage successfully:", cvUrl);
    }

    const applicationData = {
      jobId,
      applicantId: userId,
      applicantName: userName,
      email: req.user?.email || "",
      phone: "",
      fileName,
      cvUrl,
      status: "Pending"
    };

    if (useLocalDb) {
      // Create local application record
      const applications = readApplications();
      const newApp = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...applicationData,
        statusHistory: [{
          status: "Pending",
          updatedBy: userName || "Applicant",
          updatedAt: new Date().toISOString(),
          comment: "Application submitted successfully."
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      applications.push(newApp);
      writeApplications(applications);

      // Increment job CV count
      const jobs = readJobs();
      const jobIdx = jobs.findIndex((j) => j._id === jobId);
      if (jobIdx !== -1) {
        jobs[jobIdx].cvCount = (jobs[jobIdx].cvCount || 0) + 1;
        writeJobs(jobs);
      }

      // Trigger background processing (runs asynchronously)
      setTimeout(() => {
        processCVApplication(newApp._id).catch((err) => {
          console.error(`[AI Pipeline] Background processing failed for application ${newApp._id}:`, err);
        });
      }, 100);

      return res.status(201).json({ ...newApp, id: newApp._id });
    }

    // MongoDB path
    const newApp = new Application({
      ...applicationData,
      statusHistory: [{
        status: "Pending",
        updatedBy: userName || "Applicant",
        updatedAt: new Date(),
        comment: "Application submitted successfully."
      }]
    });
    await newApp.save();

    // Increment job CV count
    await Job.findByIdAndUpdate(jobId, { $inc: { cvCount: 1 } });

    // Trigger background processing (runs asynchronously)
    setTimeout(() => {
      processCVApplication(newApp._id.toString()).catch((err) => {
        console.error(`[AI Pipeline] Background processing failed for application ${newApp._id}:`, err);
      });
    }, 100);

    const obj = newApp.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (error) {
    console.error("Apply job error:", error);
    res.status(500).json({ message: error.message || "Server error applying for job" });
  }
});

// Fetch applications for a specific job post (HR access only)
app.get("/api/jobs/:id/applications", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied. Only HR can view job applications." });
    }

    if (useLocalDb) {
      const applications = readApplications();
      const filtered = applications.filter((app) => app.jobId === jobId);
      const mapped = filtered.map((app) => ({ ...app, id: app._id }));
      return res.json(mapped);
    }

    const applications = await Application.find({ jobId });
    const mapped = applications.map((app) => {
      const obj = app.toObject();
      obj.id = obj._id;
      return obj;
    });
    res.json(mapped);
  } catch (error) {
    console.error("Fetch applications error:", error);
    res.status(500).json({ message: "Server error fetching applications" });
  }
});

// Download remote file from URL (redirect-following using core http/https modules)
function downloadFile(url, destPath, redirectCount = 0) {
  if (redirectCount > 5) {
    return Promise.reject(new Error("Too many redirects"));
  }
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const headers = {};
    if (url.includes("cloudinary.com") && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const auth = Buffer.from(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`).toString("base64");
      headers["Authorization"] = `Basic ${auth}`;
    }

    protocol.get(url, { headers }, (response) => {
      // Handle HTTP redirects (301, 302, 307, 308)
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return resolve(downloadFile(response.headers.location, destPath, redirectCount + 1));
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download file: ${response.statusCode} ${response.statusMessage || ""}`));
      }

      const file = fs.createWriteStream(destPath);
      response.pipe(file);

      file.on("finish", () => {
        file.close();
        resolve();
      });

      file.on("error", (err) => {
        fs.unlink(destPath, () => { });
        reject(err);
      });
    }).on("error", (err) => {
      fs.unlink(destPath, () => { });
      reject(err);
    });
  });
}

// Spawn Python parser on the local CV file path
function runPythonParser(pdfPath) {
  return new Promise((resolve, reject) => {
    // Cross-platform: detect OS to use correct venv path
    // Windows: .venv/Scripts/python.exe  |  Linux: .venv/bin/python3
    const isWindows = process.platform === "win32";
    const backendDir = path.join(__dirname, "..", "backend");
    const pythonPath = path.join(backendDir, ".venv", isWindows ? "Scripts" : "bin", isWindows ? "python.exe" : "python3");
    const scriptPath = path.join(backendDir, "scripts", "parse_single.py");

    console.log(`[AI Pipeline] Spawning script: ${pythonPath} ${scriptPath} "${pdfPath}"`);

    const pyProcess = spawn(pythonPath, [scriptPath, pdfPath]);

    let stdoutData = "";
    let stderrData = "";

    // Handle spawn errors (e.g. python executable not found) gracefully so Node doesn't crash
    pyProcess.on("error", (spawnErr) => {
      reject(new Error(`[AI Pipeline] Failed to spawn Python process: ${spawnErr.message}. Check that the virtual environment exists at: ${pythonPath}`));
    });

    pyProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    pyProcess.on("close", (code) => {
      if (code !== 0) {
        // parse_single.py prints errors as JSON to stdout (not stderr).
        // Try to extract the JSON error message before falling back to a generic message.
        let pyErrorMsg = "";
        try {
          const lines = stdoutData.trim().split("\n");
          for (let i = lines.length - 1; i >= 0; i--) {
            const trimmed = lines[i].trim();
            if (trimmed.startsWith("{")) {
              const parsed = JSON.parse(trimmed);
              if (parsed.error) {
                pyErrorMsg = parsed.error;
                if (parsed.traceback) {
                  console.error(`[AI Pipeline] Python traceback:\n${parsed.traceback}`);
                }
              }
              break;
            }
          }
        } catch (_) { /* ignore JSON parse errors during error extraction */ }

        const fullError = pyErrorMsg || stderrData || stdoutData.substring(0, 800) || "Unknown Python error";
        console.error(`[AI Pipeline] Python stdout dump:\n${stdoutData.substring(0, 1000)}`);
        console.error(`[AI Pipeline] Python stderr dump:\n${stderrData.substring(0, 500)}`);
        return reject(new Error(`Python process exited with code ${code}. Error: ${fullError}`));
      }
      try {
        // Library logs (YOLO, PaddleOCR, BertNER) pollute stdout before the JSON result.
        // Find the last line that looks like a JSON object.
        const lines = stdoutData.trim().split("\n");
        let jsonLine = null;
        for (let i = lines.length - 1; i >= 0; i--) {
          const trimmed = lines[i].trim();
          if (trimmed.startsWith("{")) {
            jsonLine = trimmed;
            break;
          }
        }
        if (!jsonLine) {
          console.error(`[AI Pipeline] Python stdout dump:\n${stdoutData.substring(0, 1000)}`);
          return reject(new Error(`No JSON found in Python stdout. Output: ${stdoutData.substring(0, 500)}`));
        }
        const parsed = JSON.parse(jsonLine);
        if (parsed.error) {
          console.error(`[AI Pipeline] Python error: ${parsed.error}`);
          if (parsed.traceback) console.error(`[AI Pipeline] Python traceback:\n${parsed.traceback}`);
          return reject(new Error(`Python script internal error: ${parsed.error}`));
        }
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse Python stdout. Output snippet: ${stdoutData.substring(0, 500)}... Error: ${err.message}`));
      }
    });
  });
}

// Helper: Make HTTPS request with automatic retry on 429 rate limits
async function httpsRequestWithRetry(options, body, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let responseData = '';
          res.on('data', (chunk) => { responseData += chunk; });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try { resolve(JSON.parse(responseData)); }
              catch (e) { reject(new Error("Failed to parse API JSON")); }
            } else if (res.statusCode === 429 && attempt < maxRetries) {
              // Rate limited - parse retry delay from API response
              let retryDelay = 32;
              try {
                const errBody = JSON.parse(responseData);
                const retryInfo = (errBody.error?.details || []).find(d => (d["@type"] || "").includes("RetryInfo"));
                if (retryInfo?.retryDelay) {
                  retryDelay = Math.min(parseInt(retryInfo.retryDelay) || 32, 120);
                }
              } catch (_) {}
              reject({ __retryable: true, __delay: retryDelay });
            } else {
              reject(new Error(`API returned status ${res.statusCode}: ${responseData}`));
            }
          });
        });
        req.on('error', (e) => reject(e));
        req.on('timeout', () => { req.destroy(); reject(new Error('API request timeout')); });
        req.write(body);
        req.end();
      });
      return result; // Success
    } catch (err) {
      if (err?.__retryable && attempt < maxRetries) {
        console.log(`[AI Pipeline] Rate limited (429). Waiting ${err.__delay}s before retry ${attempt + 1}/${maxRetries}...`);
        await new Promise(r => setTimeout(r, err.__delay * 1000));
        continue;
      }
      throw err instanceof Error ? err : new Error(String(err));
    }
  }
}

// Compare candidate details with job description using AI (Gemini or Grok) API
async function compareCVWithJobAI(job, candidate) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const grokKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;

  if (!geminiKey && !grokKey) {
    console.warn("[AI Pipeline] ⚠️ Neither GEMINI_API_KEY nor XAI_API_KEY is configured. Using fallback matching.");
    return simulateMatching(job, candidate);
  }

  const promptText = `
You are an expert AI recruitment assistant. You evaluate candidates' CVs against job descriptions.
Output ONLY a valid JSON object matching this schema exactly:
{
  "matchScore": <integer 0-100>,
  "skillsMatched": ["matched skill 1", "matched skill 2"],
  "extractedSkills": ["individual technical skills found in candidate CV e.g. Figma, React, HTML, CSS, JavaScript, Python, SQL"],
  "extractedRoles": ["work roles/job titles found in candidate CV e.g. UI/UX Designer, Software Engineer"],
  "educationMatch": "1-2 sentences on how education fits",
  "experienceMatch": "1-2 sentences on how experience fits",
  "explanation": "2-3 sentences overall evaluation",
  "isRecommended": <boolean true if score >= 70>
}
IMPORTANT:
- extractedSkills must contain ONLY genuine technical skills (software tools, programming languages, methodologies). Exclude soft skill phrases like "Team Player" or "Referees". Each item MUST be a short skill name (1-3 words max).

Job Requirements:
Title: ${job.title}
Description: ${job.description || ""}
Required Skills: ${JSON.stringify(job.skills)}
Minimum Education: ${job.minEducation || "Any"}
Minimum Experience: ${job.minExperience || 0} years

Candidate CV - Extracted Entities (from BERT + SpaCy NER):
Skills Found: ${JSON.stringify(candidate.skills)}
Education Found: ${JSON.stringify(candidate.education)}
Work Roles Found: ${JSON.stringify(candidate.roles)}
Companies Found: ${JSON.stringify(candidate.companies || [])}
Projects Found: ${JSON.stringify(candidate.projects)}

Candidate CV - Full OCR Text:
${(candidate.rawText || "").substring(0, 3000)}`;

  try {
    let hostname = "";
    let path = "";
    let requestBody = "";
    let headers = { "Content-Type": "application/json" };
    const isGemini = !!geminiKey;

    if (isGemini) {
      console.log("[AI Pipeline] Using Gemini AI for CV comparison & entity extraction");
      hostname = "generativelanguage.googleapis.com";
      path = `/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      requestBody = JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
    } else {
      console.log("[AI Pipeline] Using Grok AI for CV comparison");
      hostname = "api.xai.com";
      path = "/v1/chat/completions";
      headers["Authorization"] = `Bearer ${grokKey}`;
      requestBody = JSON.stringify({
        model: "grok-beta",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: promptText }]
      });
    }

    headers["Content-Length"] = Buffer.byteLength(requestBody);

    const options = {
      hostname,
      port: 443,
      path,
      method: "POST",
      headers,
      timeout: 60000 // 60s timeout bypasses fetch bug
    };

    const data = await httpsRequestWithRetry(options, requestBody);

    let jsonString = "";
    if (isGemini) {
      jsonString = data.candidates[0].content.parts[0].text;
    } else {
      jsonString = data.choices[0].message.content;
    }

    // Sometimes Gemini wraps JSON in markdown block
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("[AI Pipeline] AI API call failed. Falling back to simulated matching:", error.message);
    return simulateMatching(job, candidate);
  }
}

// High-quality local algorithmic matching as robust fallback (No API Key Required!)
function simulateMatching(job, candidate) {
  // Normalize job skills for better matching
  const jobSkills = (job.skills || []).map(s => s.toLowerCase().trim());
  const candSkills = (candidate.skills || []).map(s => s.toLowerCase().trim());

  // Also check if any job skills were mentioned in the raw OCR text (often NER misses some)
  const rawTextLower = (candidate.rawText || "").toLowerCase();

  const matched = (job.skills || []).filter(skill => {
    const sLower = skill.toLowerCase().trim();
    return candSkills.includes(sLower) || rawTextLower.includes(sLower);
  });

  // 1. Calculate Skills Score (Max 50 points)
  let score = 0;
  if (jobSkills.length > 0) {
    score += (matched.length / jobSkills.length) * 50;
  } else {
    score += 50;
  }

  // 2. Calculate Experience Score (Max 30 points)
  const minYears = job.minExperience || 0;
  let expMatchText = "Experience evaluation requires manual review.";

  // Try to find year numbers in candidate text if roles array is empty
  const hasExperience = (candidate.roles && candidate.roles.length > 0) || rawTextLower.match(/\b(experience|worked|years|since 20)\b/);
  if (minYears === 0) {
    score += 30; // Perfect match if no experience required
    expMatchText = "Entry-level role, candidate meets the minimum requirements.";
  } else if (hasExperience) {
    score += 25; // Good match if they have any experience and some is required
    expMatchText = `Candidate shows relevant professional experience, potentially fulfilling the ${minYears}+ years requirement.`;
  } else {
    score += 10; // Penalty if no experience found but required
    expMatchText = `Insufficient evidence of the required ${minYears} years of experience.`;
  }

  // 3. Calculate Education Score (Max 20 points)
  let eduMatchText = "Education evaluation requires manual review.";
  const eduReq = (job.minEducation || "").toLowerCase();
  const candEduStr = JSON.stringify(candidate.education || []).toLowerCase();

  if (!eduReq || eduReq === "any") {
    score += 20;
    eduMatchText = "No strict education requirements for this role.";
  } else if (candEduStr.includes(eduReq) || candEduStr.includes("bsc") || candEduStr.includes("degree")) {
    score += 20;
    eduMatchText = `Candidate possesses a relevant degree fulfilling the ${job.minEducation} requirement.`;
  } else {
    score += 10;
    eduMatchText = `Could not definitively verify a ${job.minEducation} from the parsed text.`;
  }

  const matchScore = Math.min(Math.round(score), 100);

  // Generate Human-like Explanation
  let explanation = "";
  if (matchScore >= 80) {
    explanation = `Outstanding candidate. They perfectly match ${matched.length} out of ${job.skills.length} required skills including key technical requirements. Their background aligns strongly with the job description.`;
  } else if (matchScore >= 60) {
    explanation = `Solid candidate with good potential. They possess ${matched.length} of the required skills. Some manual review of their exact experience timeline is recommended to ensure full alignment.`;
  } else {
    explanation = `Candidate lacks several core requirements. They only matched ${matched.length} of the ${job.skills.length} essential skills. May not be the best fit unless they have alternative undocumented experience.`;
  }

  // Extract technical skills fallback from rawText
  const commonTech = [
    "Figma", "HTML", "CSS", "React", "TypeScript", "JavaScript", "Node.js", "Python",
    "SQL", "PostgreSQL", "MongoDB", "Docker", "AWS", "Java", "Spring Boot", "Git",
    "Wireframing", "Prototyping", "User Research", "Adobe XD", "Data Analysis", "Pandas"
  ];
  const extractedSkillsFromRaw = commonTech.filter(tech => rawTextLower.includes(tech.toLowerCase()));
  const allExtractedSkills = Array.from(new Set([...matched, ...extractedSkillsFromRaw, ...(candidate.skills || [])]));

  return {
    matchScore,
    skillsMatched: matched,
    extractedSkills: allExtractedSkills,
    extractedRoles: candidate.roles || [],
    educationMatch: eduMatchText,
    experienceMatch: expMatchText,
    explanation,
    isRecommended: matchScore >= 70
  };
}

// Helper to resolve the correct download URL for a Cloudinary asset
// Uses Cloudinary's private_download_url for authenticated time-limited access
function getSignedCloudinaryUrl(url) {
  try {
    if (!url.includes("cloudinary.com")) return url;

    // Parse public_id and resource_type from the stored URL
    // Example: https://res.cloudinary.com/cloud/image/upload/v123/folder/file.pdf
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return url;

    const resourceType = parts[uploadIndex - 1] || "image"; // "image", "raw", or "video"

    // Extract path after "upload/" - skip version if present (v1234...)
    let subParts = parts.slice(uploadIndex + 1);
    if (subParts[0] && subParts[0].match(/^v\d+$/)) {
      subParts = subParts.slice(1);
    }
    let publicId = subParts.join("/");

    // Strip extension from publicId (Cloudinary public IDs don't include extension)
    const extMatch = publicId.match(/^(.+)\.([^.]+)$/);
    const format = extMatch ? extMatch[2] : "pdf";
    const cleanPublicId = extMatch ? extMatch[1] : publicId;

    // Generate a private (signed, time-limited) download URL using the SDK
    const downloadUrl = cloudinary.utils.private_download_url(
      cleanPublicId,
      format,
      {
        resource_type: resourceType,
        type: "upload",
        expires_at: Math.floor(Date.now() / 1000) + 300 // 5-minute expiry
      }
    );

    console.log(`[AI Pipeline] Generated private download URL for public_id: ${cleanPublicId}`);
    return downloadUrl;
  } catch (err) {
    console.error("[AI Pipeline] Failed to generate private download URL:", err.message);
    return url;
  }
}

// Background processing function for CV applications
async function processCVApplication(applicationId) {
  let tempFilePath = "";
  let cvUrl = "";
  try {
    console.log(`[AI Pipeline] Starting background processing for Application ID: ${applicationId}`);

    // 1. Fetch the application
    let application;
    if (useLocalDb) {
      const applications = readApplications();
      application = applications.find(app => app._id === applicationId);
    } else {
      application = await Application.findById(applicationId);
    }

    if (!application) {
      throw new Error(`Application not found: ${applicationId}`);
    }

    // 2. Fetch the corresponding job
    let job;
    if (useLocalDb) {
      const jobs = readJobs();
      job = jobs.find(j => j._id === application.jobId);
    } else {
      job = await Job.findById(application.jobId);
    }

    if (!job) {
      throw new Error(`Job not found: ${application.jobId}`);
    }

    // 3. Resolve the file location (if Cloudinary, download to local temp)
    cvUrl = application.cvUrl;
    if (cvUrl.startsWith("/api/uploads/")) {
      const filename = cvUrl.replace("/api/uploads/", "");
      tempFilePath = path.join(uploadDir, filename);
    } else {
      // Cloudinary / Remote file download
      let tempName = `temp_${Date.now()}_${path.basename(cvUrl)}`;
      if (!tempName.toLowerCase().endsWith(".pdf")) {
        tempName += ".pdf";
      }
      tempFilePath = path.join(uploadDir, tempName);
      console.log(`[AI Pipeline] Downloading remote file from Cloudinary: ${cvUrl} to ${tempFilePath}`);

      // Request a signed URL from Cloudinary to authorize downloads of restricted media formats
      const signedDownloadUrl = getSignedCloudinaryUrl(cvUrl);
      await downloadFile(signedDownloadUrl, tempFilePath);
    }

    // 4. Run layout parsing and entity extraction via Python child process
    console.log(`[AI Pipeline] Running Python CV Parser on file: ${tempFilePath}`);
    const parserResult = await runPythonParser(tempFilePath);
    console.log(`[AI Pipeline] Successfully parsed CV with Python parser.`);

    // 5. Compare candidate CV details with Job requirements using Grok AI or simulated overlap
    console.log(`[AI Pipeline] Comparing parsed details with Job requirements...`);
    const comparisonResult = await compareCVWithJobAI(job, {
      skills: parserResult.entities.SKILLS || [],
      education: parserResult.entities.EDUCATION || [],
      roles: parserResult.entities.ROLE || [],
      companies: parserResult.entities.COMPANY || [],
      projects: parserResult.entities.PROJECTS || [],
      rawText: parserResult.raw_text || ""
    });
    console.log(`[AI Pipeline] Successfully completed AI comparison. Score: ${comparisonResult.matchScore}%`);

    // 6. Update database record with parsed text, skills, and AI ratings
    const junkPatterns = [
      'non-related referees', 'team player', 'communication management',
      'problem solving creativity', 'referees', 'soft skills', 'management skills'
    ];

    let candidateRawSkills = [];
    if (comparisonResult.extractedSkills && Array.isArray(comparisonResult.extractedSkills) && comparisonResult.extractedSkills.length > 0) {
      candidateRawSkills = comparisonResult.extractedSkills;
    } else if (parserResult.entities?.SKILLS && Array.isArray(parserResult.entities.SKILLS)) {
      candidateRawSkills = parserResult.entities.SKILLS;
    }

    const cleanSkills = [];
    candidateRawSkills.forEach(item => {
      if (typeof item === 'string') {
        const parts = item.split(/[,;\n]/).map(p => p.trim()).filter(Boolean);
        parts.forEach(p => {
          const lower = p.toLowerCase();
          if (p.length <= 35 && !junkPatterns.some(j => lower.includes(j))) {
            cleanSkills.push(p);
          }
        });
      }
    });

    const mergedSkills = Array.from(new Set(cleanSkills));

    let candidateRawRoles = [];
    if (comparisonResult.extractedRoles && Array.isArray(comparisonResult.extractedRoles) && comparisonResult.extractedRoles.length > 0) {
      candidateRawRoles = comparisonResult.extractedRoles;
    } else if (parserResult.entities?.ROLE && Array.isArray(parserResult.entities.ROLE)) {
      candidateRawRoles = parserResult.entities.ROLE;
    }
    const mergedRoles = Array.from(new Set(candidateRawRoles.map(r => typeof r === 'string' ? r.trim() : r).filter(Boolean)));

    const candidateEmail = parserResult.entities?.EMAIL || application.email || "";
    const candidatePhone = parserResult.entities?.PHONE || application.phone || "";

    const updatedData = {
      rawText: parserResult.raw_text || application.rawText || "",
      skills: mergedSkills,
      education: parserResult.entities?.EDUCATION || application.education || [],
      roles: mergedRoles,
      projects: parserResult.entities?.PROJECTS || application.projects || [],
      matchScore: comparisonResult.matchScore || 0,
      skillsMatched: comparisonResult.skillsMatched || [],
      educationMatch: comparisonResult.educationMatch || "-",
      experienceMatch: comparisonResult.experienceMatch || "-",
      explanation: comparisonResult.explanation || "",
      isRecommended: comparisonResult.isRecommended || false,
      status: comparisonResult.isRecommended ? "Shortlisted" : "Rejected",
      email: candidateEmail,
      phone: candidatePhone
    };

    if (useLocalDb) {
      const applications = readApplications();
      const idx = applications.findIndex(app => app._id === applicationId);
      if (idx !== -1) {
        const currentApp = applications[idx];
        const newHistory = [...(currentApp.statusHistory || [])];
        newHistory.push({
          status: updatedData.status,
          updatedBy: "AI Pipeline",
          updatedAt: new Date().toISOString(),
          comment: `CV analysis completed automatically. Match score: ${comparisonResult.matchScore}%.`
        });
        applications[idx] = {
          ...currentApp,
          ...updatedData,
          statusHistory: newHistory,
          updatedAt: new Date().toISOString()
        };
        writeApplications(applications);
      }
    } else {
      await Application.findByIdAndUpdate(applicationId, {
        $set: updatedData,
        $push: {
          statusHistory: {
            status: updatedData.status,
            updatedBy: "AI Pipeline",
            updatedAt: new Date(),
            comment: `CV analysis completed automatically. Match score: ${comparisonResult.matchScore}%.`
          }
        }
      });
    }

    console.log(`[AI Pipeline] Completed analysis successfully for Application ID: ${applicationId}`);
  } catch (err) {
    console.error(`[AI Pipeline] Error during CV background processing:`, err);
    throw err;
  } finally {
    // Clean up temporary remote file download
    if (tempFilePath && cvUrl && !cvUrl.startsWith("/api/uploads/")) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`[AI Pipeline] Cleaned up temporary download file: ${tempFilePath}`);
      } catch (cleanupErr) {
        console.error(`[AI Pipeline] Failed to delete temp file: ${tempFilePath}`, cleanupErr);
      }
    }
  }
}

// Run analysis on a specific application manually (HR only)
app.post("/api/applications/:id/analyze", authMiddleware, async (req, res) => {
  try {
    const applicationId = req.params.id;
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied. Only HR can analyze CVs." });
    }

    console.log(`[AI Pipeline] Manual analysis requested for Application ID: ${applicationId}`);
    // Run the background analysis synchronously for the response
    await processCVApplication(applicationId);

    // Fetch the updated application
    let updatedApp;
    if (useLocalDb) {
      const applications = readApplications();
      updatedApp = applications.find(app => app._id === applicationId);
    } else {
      updatedApp = await Application.findById(applicationId);
    }

    if (!updatedApp) {
      return res.status(404).json({ message: "Application not found after analysis" });
    }

    const obj = useLocalDb ? { ...updatedApp, id: updatedApp._id } : updatedApp.toObject();
    if (!useLocalDb) obj.id = obj._id;

    res.json(obj);
  } catch (error) {
    console.error("Manual analysis error:", error);
    res.status(500).json({ message: error.message || "Server error running analysis" });
  }
});

async function sendEmailViaEmailJS({ to_name, to_email, job_title, match_score, explanation }) {
  const serviceId = process.env.EMAILJS_SERVICE_ID || "service_iein0zd";
  const templateId = process.env.EMAILJS_TEMPLATE_ID || "template_la8776r";
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || "UdPCaVgF50BTauCMv";
  const privateKey = process.env.EMAILJS_PRIVATE_KEY || "oBe1SHlAtGoxWLPfIAtlF";

  if (!to_email) {
    console.warn("[EmailJS] Cannot send email: recipient address is empty.");
    return { success: false, error: "Recipient email is missing" };
  }

  const payload = JSON.stringify({
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    accessToken: privateKey,
    template_params: {
      candidate_email: to_email,
      to_email: to_email,
      user_email: to_email,
      applicant_email: to_email,
      email: to_email,
      name: to_name || "Candidate",
      to_name: to_name || "Candidate",
      title: job_title || "Position",
      job_title: job_title || "Position",
      match_score: match_score ? `${match_score}%` : "",
      explanation: explanation || "",
      message: `Dear ${to_name},\n\nWe are pleased to inform you that your application for the ${job_title} position has been reviewed.\n\nMatch Score: ${match_score}%\nAI Feedback: ${explanation}\n\nOur recruitment team will be in touch with you soon.\n\nBest regards,\nSmartHire HR Team`
    }
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: "api.emailjs.com",
      port: 443,
      path: "/api/v1.0/email/send",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      },
      timeout: 15000
    }, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[EmailJS] Successfully sent email to ${to_email}`);
          resolve({ success: true, message: body });
        } else {
          console.error(`[EmailJS] Response status ${res.statusCode} for ${to_email}: ${body}`);
          resolve({ success: false, status: res.statusCode, error: body });
        }
      });
    });

    req.on("error", (err) => {
      console.error("[EmailJS] HTTPS request error:", err.message);
      resolve({ success: false, error: err.message });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ success: false, error: "Timeout sending email via EmailJS" });
    });

    req.write(payload);
    req.end();
  });
}

// Send email to a candidate (via EmailJS & marks as sent in database)
app.post("/api/applications/:id/send-email", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { jobId, applicantId, applicantName, matchScore, explanation } = req.body;

    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied. Only HR can send emails." });
    }

    let application;
    let jobTitle = "Job Position";
    let recipientEmail = "";

    if (useLocalDb) {
      const applications = readApplications();
      application = applications.find(a => a._id === id || a.id === id);
    } else {
      application = await Application.findById(id);
    }

    if (application) {
      recipientEmail = application.email;
      if (!recipientEmail && application.applicantId) {
        if (useLocalDb) {
          const users = readUsers();
          const u = users.find(usr => usr._id === application.applicantId);
          if (u) recipientEmail = u.email;
        } else {
          const u = await User.findById(application.applicantId);
          if (u) recipientEmail = u.email;
        }
      }
      if (!recipientEmail && application.rawText) {
        const regexInfo = extractContactFromRawText(application.rawText);
        recipientEmail = regexInfo.email;
      }

      const targetJobId = application.jobId || jobId;
      if (targetJobId) {
        if (useLocalDb) {
          const jobs = readJobs();
          const j = jobs.find(jb => jb._id === targetJobId);
          if (j) jobTitle = j.title;
        } else {
          const j = await Job.findById(targetJobId);
          if (j) jobTitle = j.title;
        }
      }
    } else {
      recipientEmail = req.body.email || "";
    }

    const candidateName = applicantName || application?.applicantName || "Candidate";

    if (recipientEmail) {
      console.log(`[Send Email] Dispatching email to ${candidateName} <${recipientEmail}> for job "${jobTitle}"...`);
      const emailResult = await sendEmailViaEmailJS({
        to_name: candidateName,
        to_email: recipientEmail,
        job_title: jobTitle,
        match_score: matchScore || application?.matchScore || 0,
        explanation: explanation || application?.explanation || ""
      });
      if (!emailResult.success) {
        return res.status(400).json({
          message: `EmailJS error: ${emailResult.error || "Account not found or misconfigured"}. Please verify your Public Key and Service ID in the .env file.`
        });
      }
    } else {
      console.warn(`[Send Email] Warning: Candidate email missing for application ${id}`);
      return res.status(400).json({ message: "No email address found for this candidate." });
    }

    if (useLocalDb) {
      const applications = readApplications();
      let app = applications.find(a => a._id === id || a.id === id);
      if (!app) {
        app = {
          _id: id,
          jobId: jobId || "j4",
          applicantId: applicantId || "a4",
          applicantName: candidateName,
          email: recipientEmail,
          fileName: `${candidateName.replace(/\s+/g, '_')}_CV.pdf`,
          cvUrl: "#",
          status: "Pending",
          emailSent: true,
          matchScore: matchScore || 0,
          skillsMatched: req.body.skillsMatched || [],
          educationMatch: req.body.educationMatch || "",
          experienceMatch: req.body.experienceMatch || "",
          explanation: explanation || "",
          isRecommended: req.body.isRecommended || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        applications.push(app);
      } else {
        if (app.emailSent) {
          return res.status(400).json({ message: "Email has already been sent to this candidate" });
        }
        app.emailSent = true;
        if (recipientEmail) app.email = recipientEmail;
        app.updatedAt = new Date().toISOString();
      }
      writeApplications(applications);
      return res.json({ ...app, id: app._id, recipientEmail });
    }

    // MongoDB path
    if (!application) {
      application = new Application({
        _id: id,
        jobId: jobId || "j4",
        applicantId: applicantId || "a4",
        applicantName: candidateName,
        email: recipientEmail,
        fileName: `${candidateName.replace(/\s+/g, '_')}_CV.pdf`,
        cvUrl: "#",
        status: "Pending",
        emailSent: true,
        matchScore: matchScore || 0,
        skillsMatched: req.body.skillsMatched || [],
        educationMatch: req.body.educationMatch || "",
        experienceMatch: req.body.experienceMatch || "",
        explanation: explanation || "",
        isRecommended: req.body.isRecommended || false
      });
      await application.save();
    } else {
      if (application.emailSent) {
        return res.status(400).json({ message: "Email has already been sent to this candidate" });
      }
      application.emailSent = true;
      if (recipientEmail) application.email = recipientEmail;
      await application.save();
    }
    const obj = application.toObject();
    obj.id = obj._id;
    obj.recipientEmail = recipientEmail;
    res.json(obj);
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({ message: error.message || "Server error sending email" });
  }
});

function getMockContactDetails(id) {
  const mocks = {
    'r1': { name: 'Dinithi Jayasuriya', email: 'dinithi.j@example.com', phone: '+94 77 456 7890' },
    'r2': { name: 'Malith Rajapaksha', email: 'malith.r@example.com', phone: '+94 77 567 8901' },
    'r3': { name: 'Sanduni Weerasinghe', email: 'sanduni.w@example.com', phone: '+94 77 678 9012' },
    'r4': { name: 'Kasun Perera', email: 'kasun.perera@example.com', phone: '+94 77 123 4567' },
    'r5': { name: 'Amandi Silva', email: 'amandi.silva@example.com', phone: '+94 77 234 5678' },
    'r6': { name: 'Nuwan Fernando', email: 'nuwan.fernando@example.com', phone: '+94 77 345 6789' }
  };
  return mocks[id] || { name: "Candidate", email: "", phone: "" };
}

async function extractContactInfoWithGemini(rawText) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const promptText = `
You are an expert recruitment parser. Extract the candidate's name, email, and phone number from the raw resume text below.
Output ONLY a valid JSON object matching this schema exactly:
{
  "name": "Candidate Name",
  "email": "candidate.email@domain.com",
  "phone": "+1 555 123 4567"
}

If any field is not found in the text, return an empty string for that field.

Raw Resume Text:
${rawText.substring(0, 4000)}
`;

  const hostname = "generativelanguage.googleapis.com";
  const path = `/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  const options = {
    hostname,
    port: 443,
    path,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody)
    },
    timeout: 30000
  };

  const data = await httpsRequestWithRetry(options, requestBody);

  let jsonString = data.candidates[0].content.parts[0].text;
  jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonString);
}

function extractContactFromRawText(text) {
  if (!text) return { email: "", phone: "" };
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";
  const phoneMatch = text.match(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : "";
  return { email, phone };
}

// Fetch candidate email and phone details dynamically (HR access only)
app.get("/api/applications/:id/contact-info", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied. Only HR can view contact info." });
    }

    if (useLocalDb) {
      const applications = readApplications();
      const app = applications.find(a => a._id === id || a.id === id);
      if (!app) {
        return res.json(getMockContactDetails(id));
      }
      if (app.email || app.phone) {
        const regexInfo = extractContactFromRawText(app.rawText || "");
        return res.json({
          name: app.applicantName,
          email: app.email || regexInfo.email || "",
          phone: app.phone || regexInfo.phone || ""
        });
      }
      if (app.rawText) {
        try {
          const contact = await extractContactInfoWithGemini(app.rawText);
          const regexInfo = extractContactFromRawText(app.rawText);
          const finalEmail = contact.email || regexInfo.email || "";
          const finalPhone = contact.phone || regexInfo.phone || "";

          // Cache extracted contact info to avoid future API calls
          const allApps = readApplications();
          const cacheIdx = allApps.findIndex(a => a._id === id || a.id === id);
          if (cacheIdx !== -1) {
            allApps[cacheIdx].email = finalEmail;
            allApps[cacheIdx].phone = finalPhone;
            allApps[cacheIdx].updatedAt = new Date().toISOString();
            writeApplications(allApps);
          }
          return res.json({
            name: contact.name || app.applicantName,
            email: finalEmail,
            phone: finalPhone
          });
        } catch (err) {
          console.error("Gemini contact extraction failed (local DB):", err.message);
          const regexInfo = extractContactFromRawText(app.rawText);
          return res.json({
            name: app.applicantName,
            email: regexInfo.email || "",
            phone: regexInfo.phone || ""
          });
        }
      }
      return res.json({ name: app.applicantName, email: app.email || "", phone: app.phone || "" });
    }

    // MongoDB path
    const application = await Application.findById(id);
    if (!application) {
      return res.json(getMockContactDetails(id));
    }

    if (application.email || application.phone) {
      const regexInfo = extractContactFromRawText(application.rawText || "");
      return res.json({
        name: application.applicantName,
        email: application.email || regexInfo.email || "",
        phone: application.phone || regexInfo.phone || ""
      });
    }

    if (application.rawText) {
      try {
        const contact = await extractContactInfoWithGemini(application.rawText);
        const regexInfo = extractContactFromRawText(application.rawText);
        const finalEmail = contact.email || regexInfo.email || "";
        const finalPhone = contact.phone || regexInfo.phone || "";

        // Cache extracted contact info to avoid future API calls
        await Application.findByIdAndUpdate(id, {
          $set: { email: finalEmail, phone: finalPhone }
        });
        return res.json({
          name: contact.name || application.applicantName,
          email: finalEmail,
          phone: finalPhone
        });
      } catch (err) {
        console.error("Gemini contact extraction failed (MongoDB):", err.message);
        const regexInfo = extractContactFromRawText(application.rawText);
        return res.json({
          name: application.applicantName,
          email: regexInfo.email || "",
          phone: regexInfo.phone || ""
        });
      }
    }

    res.json({
      name: application.applicantName,
      email: application.email || "",
      phone: application.phone || ""
    });
  } catch (error) {
    console.error("Fetch contact info error:", error);
    res.status(500).json({ message: error.message || "Server error fetching contact info" });
  }
});

// Fetch all interview schedules
app.get("/api/interview-schedules", authMiddleware, async (req, res) => {
  try {
    if (useLocalDb) {
      const schedules = readSchedules();
      return res.json(schedules);
    }
    const schedules = await InterviewSchedule.find({});
    res.json(schedules);
  } catch (error) {
    console.error("Fetch schedules error:", error);
    res.status(500).json({ message: "Server error fetching interview schedules" });
  }
});

// Create or update interview schedule for a job
app.post("/api/interview-schedules", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied. Only HR can schedule interviews." });
    }

    const { jobId, jobTitle, date, time, location, notes } = req.body;
    if (!jobId || !jobTitle || !date || !time) {
      return res.status(400).json({ message: "Job ID, Job Title, Date, and Time are required" });
    }

    if (useLocalDb) {
      const schedules = readSchedules();
      let schedule = schedules.find(s => s.jobId === jobId);
      if (schedule) {
        schedule.date = date;
        schedule.time = time;
        schedule.location = location || "Zoom / Online";
        schedule.notes = notes || "";
        schedule.updatedAt = new Date().toISOString();
      } else {
        schedule = {
          _id: new mongoose.Types.ObjectId().toString(),
          jobId,
          jobTitle,
          date,
          time,
          location: location || "Zoom / Online",
          notes: notes || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        schedules.push(schedule);
      }
      writeSchedules(schedules);
      return res.json(schedule);
    }

    // MongoDB path
    const updatedSchedule = await InterviewSchedule.findOneAndUpdate(
      { jobId },
      { jobTitle, date, time, location: location || "Zoom / Online", notes: notes || "" },
      { new: true, upsert: true }
    );
    res.json(updatedSchedule);
  } catch (error) {
    console.error("Save schedule error:", error);
    res.status(500).json({ message: "Server error saving interview schedule" });
  }
});

// Search all parsed CV applications with optional filters (HR access only)
app.get("/api/applications/search", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied. Only HR can search CVs." });
    }

    const { query, skills, roles, minScore, status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (minScore) {
      filter.matchScore = { $gte: Number(minScore) };
    }

    if (skills) {
      const skillsList = skills.split(",").map(s => s.trim()).filter(Boolean);
      if (skillsList.length > 0) {
        const skillRegexes = skillsList.map(s => new RegExp(s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), "i"));
        filter.$and = filter.$and || [];
        skillRegexes.forEach(regex => {
          filter.$and.push({
            $or: [
              { skills: { $regex: regex } },
              { skillsMatched: { $regex: regex } }
            ]
          });
        });
      }
    }

    if (roles) {
      const rolesList = roles.split(",").map(r => r.trim()).filter(Boolean);
      if (rolesList.length > 0) {
        const roleRegexes = rolesList.map(r => new RegExp(r.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), "i"));
        const matchingJobs = await Job.find({ title: { $in: roleRegexes } }).select("_id id");
        const matchingJobIds = matchingJobs.map(j => j._id.toString()).concat(matchingJobs.map(j => j.id || j._id));

        filter.$or = [
          { roles: { $in: roleRegexes } },
          { jobId: { $in: matchingJobIds } }
        ];
      }
    }

    if (query) {
      filter.$text = { $search: query };
    }

    if (useLocalDb) {
      let applications = readApplications();
      const jobs = readJobs();

      if (status) {
        applications = applications.filter(app => app.status === status);
      }

      if (minScore) {
        applications = applications.filter(app => (app.matchScore || 0) >= Number(minScore));
      }

      if (skills) {
        const skillsList = skills.toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
        applications = applications.filter(app => {
          const appSkills = (app.skills || []).map(s => s.toLowerCase());
          const matchedSkills = (app.skillsMatched || []).map(s => s.toLowerCase());
          const allSkills = [...appSkills, ...matchedSkills];
          return skillsList.every(s => allSkills.some(as => as.includes(s)));
        });
      }

      if (roles) {
        const rolesList = roles.toLowerCase().split(",").map(r => r.trim()).filter(Boolean);
        applications = applications.filter(app => {
          const appRoles = (app.roles || []).map(r => r.toLowerCase());
          const job = jobs.find(j => j._id === app.jobId || j.id === app.jobId);
          const jobTitle = job ? job.title.toLowerCase() : "";
          return rolesList.some(r =>
            appRoles.some(ar => ar.includes(r)) ||
            jobTitle.includes(r)
          );
        });
      }

      if (query) {
        const queryLower = query.toLowerCase();
        applications = applications.filter(app => {
          return (
            (app.applicantName && app.applicantName.toLowerCase().includes(queryLower)) ||
            (app.rawText && app.rawText.toLowerCase().includes(queryLower)) ||
            (app.skills && app.skills.some(s => s.toLowerCase().includes(queryLower))) ||
            (app.roles && app.roles.some(r => r.toLowerCase().includes(queryLower)))
          );
        });
      }

      const mapped = applications.map(app => ({ ...app, id: app._id }));
      return res.json(mapped);
    }

    const applications = await Application.find(filter);
    const mapped = applications.map(app => {
      const obj = app.toObject();
      obj.id = obj._id;
      return obj;
    });
    res.json(mapped);
  } catch (error) {
    console.error("Search applications error:", error);
    res.status(500).json({ message: "Server error searching applications" });
  }
});

// Update application status manually with statusHistory trail logging (HR access only)
app.post("/api/applications/:id/status", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied. Only HR can update application status." });
    }

    if (!["Pending", "Shortlisted", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const userName = req.user.name || "HR Manager";

    if (useLocalDb) {
      const applications = readApplications();
      const idx = applications.findIndex(app => app._id === id || app.id === id);
      if (idx === -1) {
        return res.status(404).json({ message: "Application not found" });
      }

      const currentApp = applications[idx];
      const newHistory = [...(currentApp.statusHistory || [])];
      newHistory.push({
        status,
        updatedBy: userName,
        updatedAt: new Date().toISOString(),
        comment: comment || `Status manually updated by ${userName}.`
      });

      applications[idx] = {
        ...currentApp,
        status,
        isRecommended: status === "Shortlisted",
        statusHistory: newHistory,
        updatedAt: new Date().toISOString()
      };

      writeApplications(applications);
      return res.json({ ...applications[idx], id: applications[idx]._id });
    }

    // MongoDB path
    const app = await Application.findById(id);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    app.status = status;
    app.isRecommended = status === "Shortlisted";
    app.statusHistory.push({
      status,
      updatedBy: userName,
      updatedAt: new Date(),
      comment: comment || `Status manually updated by ${userName}.`
    });

    await app.save();
    const obj = app.toObject();
    obj.id = obj._id;
    res.json(obj);
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Server error updating status" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
