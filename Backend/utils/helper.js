import { uploadToCloudinary } from "./cloudinaryUpload.js";

//upload files
export const uploadFiles = async (files, config) => {
  const result = {};

  if (!files) return result;

  for (const key in config) {
    if (!files[key]) continue;

    const file = Array.isArray(files[key]) ? files[key][0] : files[key];

    const uploadRes = await uploadToCloudinary(
      file.buffer,
      config[key].folder,
      config[key].type,
      file.originalname,
    );
    result[key] = uploadRes.secure_url;
  }
  return result;
};

//parse and format questions
export const parseQuestion = (questionsData, type, id, userId) => {
  const parsed = JSON.parse(questionsData);
  return parsed.map((q) => {
    const date = q.postDate ? new Date(q.postDate) : new Date();
    return {
      ...(type === "company" && { company: id }),
      ...(type === "role" && { roleId: id }),
      question: q.question,
      answer: q.answer,
      keyPoints: Array.isArray(q.keyPoints)
        ? q.keyPoints
        : q.keyPoints
          ? [q.keyPoints]
          : [],
      postDate: date,
      createdBy: userId,
      askedBy: Array.isArray(q.companies)
        ? q.companies.map((c) => ({
            companyName: c.name || "",
            dateAsked: c.date || "",
          }))
        : [],
    };
  });
};

// replace all questions
export const replaceQuestions = async (Model, filter, questions) => {
  await Model.deleteMany(filter);
  await Model.insertMany(questions);
};

//handle error
export const handleError = (res, err) => {
  return res.status(500).json({
    success: false,
    message: err.message,
  });
};
