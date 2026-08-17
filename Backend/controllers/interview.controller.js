import InterviewCompanyModels from "../models/interviewCompany.models";
import InterviewQuestionModels from "../models/interviewQuestion.models";
import InterviewRoleModels from "../models/interviewRole.models";
import RoleQuestionModels from "../models/roleQuestion.models";
import { parseQuestion, uploadFiles } from "../utils/helper";

//add to interview question
export const addInterviewCompany = async (req, res) => {
  try {
    const { companyName, questionsCount, questionsData } = req.body;
    if (!companyName || !questionsCount) {
      res.status(400).json({
        success: false,
        message: "Required Fields missing",
      });
    }
    const exists = await InterviewCompanyModels.findOne({ companyName });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Company is Already Exists",
      });
    }
    const uploads = await uploadFiles(req.files, {
      logoFile: { folder: "jobportal/logos", type: "image" },
      csvFile: { folder: "jobportal/csv", type: "raw" },
    });
    const company = await InterviewCompany.create({
      companyName,
      logo: uploads.logoFile || "",
      questionCOunt,
      csvFileUrl: uploads.csvFile || "",
      createdBy: req.user.id,
    });
    if (questionData) {
      const formatted = parseQuestion(
        questionData,
        "company",
        company_id,
        req.user.id,
      );
      await InterviewQuestionModels.insertMany(formatted);
    }
    res.status(201).json({ success: true, company });
  } catch (err) {
    handleError(res, err);
  }
};

//get companies ques
export const getInterviewCompanies = async (req, res) => {
  try {
    const companies = await InterviewCompany.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    handleError(res, err);
  }
};

//now to get questions for that company
export const getInterviewQuestionByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { company, questions } = await Promise.all([
      InterviewCompany.findById(companyId),
      InterviewQuestionModels.find({ company: companyId }).sort({
        createdAt: -1,
      }),
    ]);
    res.status(200).json({
      success: true,
      company,
      questions,
    });
  } catch (error) {
    handleError(res, err);
  }
};

// Update Company
export const updateInterviewCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { companyName, questionsCount, questionsData } = req.body;

    const company = await InterviewCompany.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (companyName) company.companyName = companyName;
    if (questionsCount) company.questionsCount = questionsCount;

    const uploads = await uploadFiles(req.files, {
      logoFile: { folder: "jobportal/logos", type: "image" },
      csvFile: { folder: "jobportal/csv", type: "raw" },
    });

    if (uploads.logoFile) company.logo = uploads.logoFile;
    if (uploads.csvFile) company.csvFileUrl = uploads.csvFile;

    await company.save();

    if (questionsData) {
      const formatted = parseQuestions(
        questionsData,
        "company",
        company._id,
        req.user.id,
      );

      await replaceQuestions(
        InterviewQuestion,
        { company: companyId },
        formatted,
      );
    }

    res.status(200).json({ success: true, company });
  } catch (err) {
    handleError(res, err);
  }
};

//delete a company
export const deleteInterviewCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    await InterviewCompany.findByIdAndDelete(companyId);
    await InterviewQuestion.deleteMany({ company: companyId });

    res.status(200).json({
      success: true,
      message: "Company Delete Successfully!",
    });
  } catch (error) {
    handleError(res, err);
  }
};

//Role Question
//To add a role
export const addInterviewRole = async (req, res) => {
  try {
    const { roleName, questionCount, questionData } = req.body;
    if (!roleName || !questionCount) {
      return res.status(400).json({
        message: "Required Fields Missing",
      });
    }
    const exists = await InterviewRoleModels.findOne({ roleName });
    if (exists) {
      return res.status(200).json({
        message: "Role is already Exists",
      });
    }
    const uploads = await uploadFiles(req.files, {
      logoFile: { folder: "jobportal/logos", type: "image" },
      csvFile: { folder: "jobportal/csv", type: "raw" },
    });
    const role = await InterviewRoleModels.create({
      roleName,
      image: uploads.imageFile || "",
      questionCount,
      csvFileUrl: uploads.csvFile || "",
      createdBy: req.user.id,
    });
  } catch (error) {
    handleError(res, err);
  }
};
