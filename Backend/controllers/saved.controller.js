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
  } catch (error) {}
};
