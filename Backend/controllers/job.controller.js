import Job from "../models/job.model.js";
import Application from "../models/application.model.js";

//create a job
export const createJob = async (req, res) => {
  try {
    let {
      roleName,
      companyName,
      techStack,
      location,
      experience,
      salary,
      salaryType,
      jobType,
      postDate,
      category,
      openings,
      overview,
      responsibilities,
      jobCriteria,
      education,
    } = req.body;

    //handle arrays if sent as JSON string
    let postDateValue;
    if (postDate) {
      if (
        typeof postDate === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(postDate)
      ) {
        const [year, month, day] = postDate.split("-");
        postDateValue = new Date(
          Date.UTC(Number(year), Number(month) - 1, Number(day)),
        );
      } else {
        postDateValue = new Date(postDate);
      }
      if (isNaN(postDateValue.getTime())) {
        postDateValue = new Date();
      }
    } else {
      postDateValue = new Date();
    }

    let companyLogo = "";
    if (req.file) {
      const uploadRes = await uploadToCloudinary(
        req.file.buffer,
        "jobportal/logos",
        "image",
        req.file.originalname,
      );
      companyLogo = uploadRes.secure_url;
    }

    const job = new Job({
      companyLogo,
      roleName,
      companyName,
      techStack,
      location,
      experience,
      salary,
      salaryType,
      jobType,
      postData,
      category,
      openings,
      overview,
      responsibilities,
      jobCriteria,
      education,
      postDate: postDateValue,
      createdBy: req.user.id,
    });
    await job.save();
    return res.status(200).json({
      success: true,
      message: "Job posted Successfully!",
      job,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// to get all jobs
export const getAllJobs = async (req, res) => {
  try {
    const {
      roleName,
      companyName,
      location,
      category,
      jobType,
      experience,
      minSalary,
      maxSalary,
      search,
    } = req.query;
    const query = { status: "active" };

    //search by roleName, companyName, or techstack
    if (search) {
      query.$or = [
        { roleName: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { techStack: { $regex: search, $options: "i" } },
      ];
    }
    if (roleName) query.roleName = { $regex: roleName, $options: "i" };
    if (companyName) query.companyName = { $regex: companyName, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };
    if (experience) query.experience = { $regex: experience, $options: "i" };

    if (category) {
      const categories = Array.isArray(category)
        ? category
        : category.split(",");
      query.category = { $in: categories.map((cat) => new RegExp(cat, "i")) };
    }
    if (jobType) {
      const types = Array.isArray(jobType) ? jobType : jobType.split(",");
      const normalizeTypeToRegex = (type) => {
        const raw = String(type).trim();
        const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Normalize spaces, hyphens, underscores
        const normalized = escaped.replace(/[-_\s]+/g, "[-_\\s]*");
        return new RegExp(`^${normalized}$`, "i");
      };
      query.jobType = { $in: types.map(normalizeTypeToRegex) };
    }

    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) query.salary.$gte = Number(minSalary);
      if (maxSalary) query.salary.$lte = Number(maxSalary);
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// to get dashboard stats for admin
export const getDashboardStats = async (req, res) => {
  try {
    const adminId = req.user.id;
    const totalJobs = await Job.countDocuments();
    const closedJobs = await Job.countDocuments({ status: "closed" });
    const totalApplicationResult = await Application.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userRecord",
        },
      },
      { $unwind: "$userRecord" },
      {
        $lookup: {
          from: "jobs",
          localField: "job",
          foreignField: "_id",
          as: "jobRecord",
        },
      },
      { $unwind: "$jobRecord" },
      { $count: "count" },
    ]);
    const totalApplication = totalApplicationResult[0]?.count || 0;
    const companies = await Job.distinct("companyName", { status: "active" });
    const totalCompanies = companies.length;

    return res.status(200).json({
      success: true,
      stats: {
        totalJobs: totalJobs.toLocaleString(),
        closedJobs: closedJobs.toLocaleString(),
        totalApplicants: totalApplications.toLocaleString(),
        totalCompanies: totalCompanies.toLocaleString(),
      },
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// get all jobs by the admin
