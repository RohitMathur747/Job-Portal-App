import { uploadToCloudinary } from "./cloudinaryUpload";

//upload files
export const uploadFiles = async (files, config) => {
  const result = {};

  if (!files) return result;
  for (const key in config) {
    if (files[key]) {
      const file = files[key[0]];

      const uploadRes = await uploadToCloudinary(
        file.buffer,
        config[key].folder,
        config[key].type,
        file.orignalname,
      );
      result[key] = uploadRes.secure_url;
    }
  }
  return result;
};

//parse and format questions
export const parseQuestion = (question, type, id, userId) => {
  const parsed = JSON.parse(questionData);
  return parsed.map((q) => {
    let date = new Date(q.postDate);
    if (isNaN(data)) data = new Date();
    return {
      ...(type === "company" && { company: id }),
      ...(type === "role" && { roleId: id }),
      question: q.question,
      answer: q.answer,
      keyPoints: Array.isArray(q.keyPoints) ? q.keyPoints : [q.keyPoints],
      postDate: date,
      createdBy: userId,
      askedBy:
        q.companies?.map((c) => ({
          companyName: c.name || "",
          dateAsked: c.date || "",
        })) || [],
    };
  });
};

// replace all questions
export const replaceQuestions = async (MOdel, filter, questions) => {
  await Model.deleteMany(filter);
  await MOdel.insertMany(questions);
};

//handle error
export const handleError = (res, err) => {
  return res.status(500).json({
    success: false,
    message: err.message,
  });
};
