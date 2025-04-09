import { Job } from "../models/jobSchema.js";

// =====================
// Get All Jobs
// =====================
export const getAllJobs = async (req, res) => {
  try{
    const jobs = await Job.find({ expired: false });
  res.status(200).json({
    success: true,
    jobs,
  });
  }
  catch(error){
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
  })
}
};

// =====================
// Post a Job
// =====================
export const postJob = async (req, res) => {
  try{
    const { role, _id: postedBy } = req.user;

  if (role === "Job Seeker") {
    return res.status(403).json({
      success: false,
      message: "Job Seekers are not allowed to post jobs.",
    });
  }

  const {
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
  } = req.body;

  if (!title || !description || !category || !country || !city || !location) {
    return res.status(400).json({
      success: false,
      message: "Please provide full job details.",
    });
  }

  if ((!salaryFrom || !salaryTo) && !fixedSalary) {
    return res.status(400).json({
      success: false,
      message: "Please provide either fixed salary or ranged salary.",
    });
  }

  if (salaryFrom && salaryTo && fixedSalary) {
    return res.status(400).json({
      success: false,
      message: "Cannot provide both fixed and ranged salary.",
    });
  }

  const job = await Job.create({
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    postedBy,
  });

  res.status(201).json({
    success: true,
    message: "Job posted successfully!",
    job,
  });
  }
  catch(error){
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================
// Get Employer's Jobs
// =====================
export const getMyJobs = async (req, res) => {
  try{
    const { role, _id } = req.user;

  if (role === "Job Seeker") {
    return res.status(403).json({
      success: false,
      message: "Job Seekers cannot access this resource.",
    });
  }

  const myJobs = await Job.find({ postedBy: _id });

  res.status(200).json({
    success: true,
    myJobs,
  });
  }
  catch(error){
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================
// Update a Job
// =====================
export const updateJob = async (req, res) => {
  const { role } = req.user;
  const { id } = req.params;

  try{
    if (role === "Job Seeker") {
      return res.status(403).json({
        success: false,
        message: "Job Seekers cannot update jobs.",
      });
    }
  
    let job = await Job.findById(id);
  
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }
  
    job = await Job.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  
    res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      job,
    });
  }
  catch(error){
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================
// Delete a Job
// =====================
export const deleteJob = async (req, res) => {
  try{
    const { role } = req.user;
  const { id } = req.params;

  if (role === "Job Seeker") {
    return res.status(403).json({
      success: false,
      message: "Job Seekers cannot delete jobs.",
    });
  }

  const job = await Job.findById(id);
  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found.",
    });
  }

  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: "Job deleted successfully.",
  });
  }
  catch(error){
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================
// Get Single Job
// =====================
export const getSingleJob = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
