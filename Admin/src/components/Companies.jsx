import React, { useState, useRef, useEffect } from "react";
import { companiesPageStyles as s } from "../assets/dummyStyles";

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

  return (
    <div className={s.pageContainer}>
      <h2>Companies Page</h2>
    </div>
  );
};

export default Companies;
