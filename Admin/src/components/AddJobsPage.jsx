import React, { useEffect, useState, useRef } from "react";
import { addJobsPageStyles as s } from "../assets/dummyStyles";
import {
  Briefcase,
  X,
  Image as ImageIcon,
  Upload,
  Building2,
} from "lucide-react";
import axios from "axios";

//small toast component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onclose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className={s.toastWrapper}>
      <div
        className={`${toastContent} ${
          type === "success" ? s.toastSuccess : s.toastError
        }`}
      >
        <div className="relative">
          <div
            className={`${s.toastDot} ${type === "success" ? s.toastDotSuccess : s.toastDotError}`}
          ></div>
        </div>
        <div
          className={`${s.toastDotStatic} ${type === "success" ? s.toastDotSuccess : s.toastDotError}`}
        ></div>
      </div>
      <span className={s.toastMessage}>{message}</span>
      <button onClick={onClose} className={s.toastCloseBtn}>
        <X size={16} />
      </button>
    </div>
  );
};

// for animated input field
// Animated input field component
const AnimatedField = ({
  icon: Icon,
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required,
  children,
  disabled,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={s.fieldContainer}>
      {label && (
        <label className={s.fieldLabel}>
          {label} {required && <span className={s.requiredStar}>*</span>}
        </label>
      )}
      <div
        className={`${s.fieldWrapper} ${focused ? s.fieldFocusedScale : ""}`}
      >
        <div className={s.fieldGlow} />
        <div
          className={`${s.fieldInner} ${
            error
              ? s.fieldInnerError
              : focused
                ? s.fieldInnerFocused
                : s.fieldInnerDefault
          }`}
        >
          <span className={s.fieldIconSpan}>
            {Icon && (
              <Icon
                size={18}
                className={`transition-colors duration-300 ${
                  focused ? s.fieldIconFocused : ""
                }`}
              />
            )}
          </span>
          <div className={s.fieldInputWrapper}>
            {type === "select" ? (
              <select
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={s.selectInput}
              >
                {children}
              </select>
            ) : type === "textarea" ? (
              <textarea
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                rows={4}
                className={s.textareaInput}
                placeholder={placeholder}
              />
            ) : (
              <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={s.inputBase}
                placeholder={placeholder}
                disabled={disabled}
              />
            )}
          </div>
          {required && <span className={s.requiredSpan}>*</span>}
        </div>
      </div>
      {error && <p className={s.errorText}>{error}</p>}
    </div>
  );
};

// Image Upload Component
const ImageUpload = ({ image, setImage, error }) => {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const prevUrlRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    if (image) {
      const url = URL.createObjectURL(image);
      setPreview(url);
      prevUrlRef.current = url;
    } else {
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
  }, [image]);

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const removeImage = () => {
    setImage(null);
  };

  return (
    <div className={s.uploadContainer}>
      <label className={s.uploadLabel}>
        <ImageIcon size={16} className={s.uploadIcon} /> Company Logo{" "}
        <span className={s.uploadRequired}>*</span>
      </label>
      <div
        className={`${s.uploadDropzone} ${
          dragActive
            ? s.uploadDropzoneActive
            : error
              ? s.uploadDropzoneError
              : preview
                ? s.uploadDropzonePreview
                : s.uploadDropzoneDefault
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className={s.previewContainer}>
            <img src={preview} alt="Preview" className={s.previewImage} />
            <button
              type="button"
              onClick={removeImage}
              className={s.removeImageBtn}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className={s.uploadPlaceholder}>
            <Upload className={s.uploadIconLarge} />
            <p className={s.uploadText}>
              Drag & drop an image here, or{" "}
              <label className={s.browseLabel}>
                Browse
                <input
                  ref={fileInputRef}
                  type="file"
                  className={s.fileInputHidden}
                  accept="image/*"
                  onChange={handleChange}
                />
              </label>
            </p>
          </div>
        )}
      </div>
      {error && <p className={s.errorText}>{error}</p>}
    </div>
  );
};

//to get today date
const getTodayDate = () => new Date().toISOString().split("T")[0];

const initialFormState = {
  image: null,
  roleName: "",
  companyName: "",
  techStack: [""],
  location: "",
  experience: "",
  salary: { amount: "", period: "month" },
  jobType: "full-time",
  postDate: getTodayDate(),
  category: "",
  overview: "",
  openings: 1,
  responsibilities: [""],
  jobCriteria: [""],
  education: [""],
};

const categories = [
  "Engineering",
  "IT",
  "Data Science",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Finance",
];

const AddJobsPage = () => {
  const [formData, setFormData] = useState({ ...initialFormState });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [errors, setErrors] = useState({});
  const [isPosting, setIsPosting] = useState(false);

  //to handle array change
  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData(field)];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  // to add array field
  const addArrayField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  // to remove
  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData({ ...formData, [field]: newArray });
    }
  };

  // to validate form field
  const validateForm = () => {
    const newErrors = {};
    if (!formData.image) newErrors.image = "Company logo is required";
    if (!formData.roleName) newErrors.roleName = "Role name is required";
    if (!formData.companyName)
      newErrors.companyName = "Company name is required";
    if (!formData.techStack.some((item) => item.trim()))
      newErrors.techStack = "At least one tech stack is required";
    if (!formData.location || !formData.location.trim())
      newErrors.location = "Location is required";
    if (!formData.experience) newErrors.experience = "Experience is required";
    if (!formData.salary.amount) newErrors.salary = "Salary amount is required";
    if (!formData.postDate) newErrors.postDate = "Post date is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.overview) newErrors.overview = "Overview is required";
    if (!formData.openings)
      newErrors.openings = "Number of openings is required";
    if (!formData.responsibilities.some((item) => item.trim()))
      newErrors.responsibilities = "At least one responsibility is required";
    if (!formData.jobCriteria.some((item) => item.trim()))
      newErrors.jobCriteria = "At least one job criteria is required";
    if (!formData.education.some((item) => item.trim()))
      newErrors.education = "At least one education requirement is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // to submit the data to server
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsPosting(true);
        const formDataToSend = new FormData();
        formDataToSend.append("roleName", formData.roleName);
        formDataToSend.append("companyName", formData.companyName);
        formDataToSend.append("location", formData.location);
        formDataToSend.append("experience", formData.experience);
        formDataToSend.append("salary", formData.salary.amount);
        formDataToSend.append("salaryType", formData.salary.period);
        formDataToSend.append("jobType", formData.jobType);
        formDataToSend.append("postDate", formData.postDate);
        formDataToSend.append("category", formData.category);
        formDataToSend.append("openings", formData.openings);
        formDataToSend.append("overview", formData.overview);

        formDataToSend.append(
          "techStack",
          JSON.stringify(
            formData.techStack.filter((item) => item.trim() !== ""),
          ),
        );
        formDataToSend.append(
          "responsibilities",
          JSON.stringify(
            formData.responsibilities.filter((item) => item.trim() !== ""),
          ),
        );
        formDataToSend.append(
          "jobCriteria",
          JSON.stringify(
            formData.jobCriteria.filter((item) => item.trim() !== ""),
          ),
        );
        formDataToSend.append(
          "education",
          JSON.stringify(
            formData.education.filter((item) => item.trim() !== ""),
          ),
        );

        if (formData.image) {
          formDataToSend.append("companyLogo", formData.image);
        }

        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:5000/api/job",
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.data.success) {
          setToast({
            show: true,
            message: "Job Posted Successfully!",
            type: "success",
          });
          setFormData({ ...initialFormState, postDate: getTodayDate() }); //reset the form
          setErrors({});
        }
      } catch (error) {
        console.error("Error Posting Jobs:", error);
        setToast({
          show: true,
          message:
            error?.response?.data?.message ||
            "Failed to post job.Plese try again.",
          type: "error",
        });
      } finally {
        setIsPosting(false);
      }
    } else {
      setToast({
        show: true,
        message: "Please fill all requirements",
        type: "error",
      });
    }
  };

  return (
    <div className={s.pageContainer}>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({
              ...toast,
              show: false,
            })
          }
        />
      )}

      <div className={s.contentWrapper}>
        <div className={s.headerCenter}>
          <h1 className={s.title}>
            <Briefcase size={32} />
            <span className={s.titleInner}>Post a New Job</span>
          </h1>
          <p className={s.subtitle}>
            Create a Beautiful,high-converting job listing
          </p>
        </div>
        <form onSubmit={handleSubmit} className={s.formCard}>
          <div className={s.grid3}>
            <div className={s.colSpan1}>
              <ImageUpload
                image={formData.image}
                setImage={(file) => setFormData({ ...formData, image: file })}
                errors={errors.image}
              />
            </div>

            <div className={s.mdColSpan2}>
              <AnimatedField
                icon={Briefcase}
                label="Role Name"
                name="rolename"
                value={formData.roleName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    roleName: e.target.value,
                  })
                }
                errors={errors.roleName}
                placeholder="eg. Senior Frontend Developer"
                required
              />

              <AnimatedField
                icon={Building2}
                label="Company Name"
                name="companyname"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companyName: e.target.value,
                  })
                }
                errors={errors.companyName}
                placeholder="eg. Acme Inc"
                required
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobsPage;
