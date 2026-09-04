import React, { useState, useRef, useEffect } from "react";
import { companiesPageStyles as s } from "../assets/dummyStyles";
import { CheckCircle, Link2, Loader2, Upload, X, XCircle } from "lucide-react";
import axios from "axios";

const Companies = () => {
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // to fetch companies from the backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/companies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!toast || toast.confirm) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // image handling
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        try {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (error) {
          //ignore
        }
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreview("");
    }
  };

  //to validate form data field
  const validateForm = () => {
    const newErrors = {};
    if (!logoFile) newErrors.logo = "Logo is required";
    if (!website.trim()) {
      newErrors.website = "Website URL is required";
    } else if (!/^https?:\/\/.+\..+/.test(website)) {
      newErrors.website = "Enter a valid URL (e.g., https://example.com)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("companyLogo", logoFile);
      formDataToSend.append("website", website.trim());

      const res = await fetch("http://localhost:5000/api/companies", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      const data = await res.json();
      setCompanies((prevCompanies) => [...prevCompanies, data]);
      setToast({ message: "Company added successfully!", type: "success" });
      setLogoFile(null);
      setLogoPreview("");
      setWebsite("");
      setErrors({});
    } catch (error) {
      setToast({
        message: "Failed to add company. Please try again.",
        type: "error",
        error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // to delete a company
  const requestDeleteCompany = async (companyId) => {
    setPendingDeleteId(companyId);
    setToast({
      type: "confirm",
      confirm: true,
      message: "Are you sure you want to delete this company?",
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/company/${pendingDeleteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setCompanies((prevCompanies) =>
        prevCompanies.filter((company) => company._id !== pendingDeleteId),
      );
      setToast({ message: "Company deleted successfully!", type: "success" });
      setPendingDeleteId(null);
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message ||
          "Failed to delete company. Please try again.",
        type: "error",
      });
    }
  };

  // to cancel the delete
  const handleCancelDelete = () => {
    setPendingDeleteId(null);
    setToast(null);
  };

  return (
    <div className={s.pageContainer}>
      {toast && (
        <div className={s.toastWrapper}>
          <div
            className={`${s.toastBase} ${toast.type === "success" ? s.toastSuccess : ""} ${toast.type === "error" ? s.toastError : ""}`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={20} className={s.toastIconSuccess} />
            ) : toast.type === "error" ? (
              <XCircle size={20} className={s.toastIconError} />
            ) : (
              <XCircle size={20} className={s.toastIconConfirm} />
            )}

            <div className={s.toastContent}>
              <span className={s.toastMessage}>{toast.message}</span>
              {toast.type === "confirm" && (
                <div className={s.toastActionRow}>
                  <button
                    className={s.toastConfirmBtn}
                    onClick={handleConfirmDelete}
                  >
                    Confirm
                  </button>
                  <button
                    className={s.toastCancelBtn}
                    onClick={handleCancelDelete}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {!toast.confirm && (
              <button
                className={s.toastCloseBtn}
                onClick={() => setToast(null)}
              >
                <X size={16} />
              </button>
            )}

            <div className={s.contentWrapper}>
              <header className={s.header}>
                <h1 className={s.headerTitle}>Add Company</h1>
                <p className={s.headerSubtitle}>
                  upload a company logo and provide the company's website URL to
                  add a new company to the list.
                </p>
              </header>
              <div className={s.formCard}>
                <form onSubmit={handleSubmit} className={s.form}>
                  {/* logo upload */}
                  <div>
                    <label className={s.logoLabel}>
                      Company Logo <span className={s.requiredStar}>*</span>
                    </label>
                    <div className={s.logoContainer}>
                      <div className={s.previewWrapper}>
                        {logoPreview ? (
                          <div className={s.previewBox}>
                            <img
                              src={logoPreview}
                              alt="logo"
                              className={s.previewImage}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoPreview("");
                                try {
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                  }
                                } catch (error) {
                                  //ignore
                                }
                              }}
                              className={s.removeLogoBtn}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className={s.placeholderBox}>
                            <Upload size={24} className={s.uploadIcon} />
                          </div>
                        )}
                      </div>

                      <div className={s.uploadArea}>
                        <label htmlFor="logoUpload" className={s.uploadLabel}>
                          <Upload size={16} className={s.uploadIconSmall} />
                          <span>Choose File</span>
                        </label>
                        <input
                          type="file"
                          id="logoUpload"
                          accept="image/*"
                          onChange={handleLogoChange}
                          ref={fileInputRef}
                          className={s.fileInput}
                        />
                      </div>
                    </div>
                    {errors.logo && (
                      <span className={s.errorText}>{errors.logo}</span>
                    )}
                  </div>
                  {/* website input */}
                  <div>
                    <label className={s.websiteLabel}>
                      website URL <span className={s.requiredStar}>*</span>
                    </label>
                    <div className={s.inputWrapper}>
                      <Link2 size={18} className={s.inputIcon} />
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className={`${s.websiteInput}${errors.websiteInput}${errors.website ? s.inputError : s.inputDefault}`}
                        placeholder="http://example.com"
                      />
                    </div>
                    {errors.website && (
                      <span className={s.errorText}>{errors.website}</span>
                    )}
                  </div>
                  {/* submit button */}
                  <button
                    type="submit"
                    className={`${s.submitBtn} ${isLoading ? s.submitBtnLoading : ""}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className={s.spinner} />
                      </>
                    ) : (
                      <>Add Company</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
