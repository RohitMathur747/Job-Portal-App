import User from "../models/user.models.js";

//toggle save job
export const toggleSaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User jot found",
      });
    }
    const isSaved = user.savedJobs.includes(jobId);
    if (isSaved) {
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }
    await user.save();
    res.status(200).json({
      success: true,
      message: isSaved ? "Job unsaved" : "JOb saved",
      savedJObs: user.savedJobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//toggle save questions
export const toggleSaveQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { type } = req.query;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User jot found",
      });
    }
    let isSaved;
    let message;
    if (type === "role") {
      isSaved = user.savedRoleQuestions.includes(questionId);
      if (isSaved) {
        user.savedRoleQuestions = user.savedRoleQuestions.filter(
          (id) => id.toString() !== questionId,
        );
        message = "Question unsaved";
      } else {
        user.savedRoleQuestions.push(questionId);
        message = "Question Saved";
      }
    } else {
      //default to interview question
      isSaved = user.savedInterviewQuestions.includes(questionId);
      if (isSaved) {
        user.savedInterviewQuestions = user.savedInterviewQuestions.filter(
          (id) => id.toString() !== questionId,
        );
        message = "Question unsaved";
      } else {
        user.savedInterviewQuestions.push(questionId);
        message = "Question Saved";
      }
    }
    await user.save();
    res.status(200).json({
      success: true,
      message,
      savedInterviewQuestions: user.savedInterviewQuestions,
      savedRoleQuestions: user.savedRoleQuestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//to get all saved items
export const getSavedItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate("savedJobs")
      .populate({
        path: "savedInterviewQuestions",
        populate: { path: "company" },
      })
      .populate({
        path: "savedRoleQuestions",
        populate: { path: "roleId" },
      });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User jot found",
      });
    }
    res.status(200).json({
      success: true,
      savedJobs: user.savedJobs,
      savedInterviewQuestions: user.savedInterviewQuestions,
      savedRoleQuestions: user.savedRoleQuestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
