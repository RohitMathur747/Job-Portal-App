import Inquiry from "../models/inquiry.models.js";
import { sendAdminInquiryEmail } from "../utils/emailService.js";

//to submit a query
export const submitInquiry = async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    if (!fullName || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the required fields",
      });
    }
    const inquiry = await Inquiry.create({
      fullName,
      email,
      phone,
      subject,
      message,
    });
    try {
      await sendAdminInquiryEmail({ fullName, email, phone, subject, message });
    } catch (emailError) {
      console.error("Failed to send the admin via email", emailError);
    }
    res.status(201).json({
      success: true,
      inquiry,
      message: "Inquiry Submitted Successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
