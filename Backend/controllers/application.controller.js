import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.models.js";

//user to apply for job
export const applyJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    if (!jobId) {
      return res.status(404).json({
        success: false,
        message: "job Id is required",
      });
    }
    //check job exists or not
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "job not found",
      });
    }
    //check the user profile is completed or not
    const user = await User.findById(userId);
    if (!user || !user.phone || !user.resume) {
      return res.status(404).json({
        success: false,
        message:
          "please complete your profile(add phone number and resume) in your profile before apply for job",
      });
    }

    //check if user already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      user: userId,
    });
    if (existingApplication) {
      return res.status(404).json({
        success: false,
        message: "you have already applied for this job",
      });
    }

    const newApplication = new Application({
      job: jobId,
      user: userId,
    });
    await newApplication.save();
    return res.status(200).json({
      success: true,
      message: "Application Submitted Successfully!",
    });
  } catch (error) {
    console.error("Error applying the job:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

//get all applicants for a job(admin panel)
export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "job not found",
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate({
        path: "user",
        select: "name email phone role resume",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      jobName: job.roleName,
      applicants: applications
        .filter((app) => app.user)
        .map((app) => ({
          applicationId: app._id,
          ...app.user._doc,
          appliedData: app.createdAt,
          resume: app.user.resume || "",
        })),
    });
  } catch (error) {
    console.error("Error fetching the applicants:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

//get all jobs applied by user
export const getUserApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const application = await Application.find({ user: userId })
      .populate("job")
      .sort({ createdAt: -1 });
    const validApplication = application.filter((app) => app.job !== null);
    return res.status(200).json({
      success: true,
      application: validApplication,
    });
  } catch (error) {
    console.error("Error user fetching applications:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};
