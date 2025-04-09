import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";

// ==============================
// Post a new job application
// ==============================
export const postApplication = async (req, res) => {

  try{
    const { role, _id: userId } = req.user;

  if (role === "Employer") {
    return res.status(403).json({
      success: false,
      message: "Employers are not allowed to apply for jobs.",
    });
  }

  if (!req.files?.resume) {
    return res.status(400).json({
      success: false,
      message: "Resume file is required.",
    });
  }

  const resume = req.files.resume;
  const { name, email, coverLetter, phone, address, jobId } = req.body;

  if (!name || !email || !coverLetter || !phone || !address || !jobId) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all required fields.",
    });
  }

  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found.",
    });
  }

  const uploadResult = await cloudinary.uploader.upload(resume.tempFilePath);
  if (!uploadResult?.secure_url) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload resume.",
    });
  }

  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID: {
      user: userId,
      role: "Job Seeker",
    },
    employerID: {
      user: job.postedBy,
      role: "Employer",
    },
    resume: {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "Application submitted successfully.",
    application,
  });
  }
  catch (error) {
    console.error("Error in postApplication:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// =====================================
// Get all applications for employer
// =====================================
export const employerGetAllApplications = catchAsyncErrors(async (req, res) => {
  const { role, _id } = req.user;

  if (role === "Job Seeker") {
    return res.status(403).json({
      success: false,
      message: "Job Seekers are not allowed to access this resource.",
    });
  }

  const applications = await Application.find({ "employerID.user": _id });

  res.status(200).json({
    success: true,
    applications,
  });
});

// =====================================
// Get all applications for job seeker
// =====================================
export const jobseekerGetAllApplications = catchAsyncErrors(async (req, res) => {
  const { role, _id } = req.user;

  if (role === "Employer") {
    return res.status(403).json({
      success: false,
      message: "Employers are not allowed to access this resource.",
    });
  }

  const applications = await Application.find({ "applicantID.user": _id });

  res.status(200).json({
    success: true,
    applications,
  });
});

// =====================================
// Delete an application by job seeker
// =====================================
export const jobseekerDeleteApplication = catchAsyncErrors(async (req, res) => {
  const { role } = req.user;
  const { id } = req.params;

  if (role === "Employer") {
    return res.status(403).json({
      success: false,
      message: "Employers are not allowed to perform this action.",
    });
  }

  const application = await Application.findById(id);
  if (!application) {
    return res.status(404).json({
      success: false,
      message: "Application not found.",
    });
  }

  await application.deleteOne();

  res.status(200).json({
    success: true,
    message: "Application deleted successfully.",
  });
});
