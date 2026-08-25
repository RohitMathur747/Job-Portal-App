import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardStyles as s, statColors } from "../assets/dummyStyles";
import {
  Building,
  Briefcase,
  CheckCircle,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";

const Dashboard = () => {
  const [companyFilter, setCompanyFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: "0",
    closeJobs: "0",
    totalApplicants: "0",
    totalCompanies: "0",
  });

  const [toast, setToast] = useState(null);
  const [jobs, setJobs] = useState([]);

  const navigate = useNavigate();

  //to fetch the data

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // to fetch the stats
        const statsRes = await fetch(
          "http://localhost:5000/api/job/admin/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const statsData = await statsRes.json();
        if (statsData.success) {
          setDashboardStats(statsData.stats);
        }

        // to fetch jobs
        const jobRes = await fetch("http://localhost:5000/api/job/admin/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const jobsData = await jobRes.json();
        if (jobsData.success) {
          const mappedJobs = jobsData.jobs.map((j) => ({
            id: j._id,
            name: j.companyName,
            role: j.roleName,
            location: j.location,
            category: j.category,
            logo: j.companyLogo?.startsWith("http")
              ? j.companyLogo
              : `http://localhost:5000${j.companyLogo || ""}`,
            applicants: j.applicantsCount || 0,
            status: j.status || "active",
          }));
          setJobs(mappedJobs);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // handle toast auto-dismiss
  useEffect(() => {
    if (toast && toast.confirm) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  //to handle close job
  const handleCloseJob = (jobId) => {
    setToast({
      message: "Are you sure you want to close the job",
      type: "confirm",
      confirm: true,
      jobId,
    });
  };

  //to close
  const handleConfirmClose = async () => {
    const jobId = toast.jobId;
    setToast(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/job/${jobId}/close`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: "Job Closed Successfully!", type: "success" });
        // refresh the stats
        const statsRes = await fetch(
          "http://localhost:5000/api/job/admin/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const statsData = await statsRes.json();
        if (statsData.success) {
          setDashboardStats(statsData.stats);
        }
        const jobRes = await fetch("http://localhost:5000/api/job/admin/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const jobsData = await jobRes.json();
        if (jobsData.success) {
          const mappedJobs = jobsData.jobs.map((j) => ({
            id: j._id,
            name: j.companyName,
            role: j.roleName,
            location: j.location,
            category: j.category,
            logo: j.companyLogo?.startsWith("http")
              ? j.companyLogo
              : `http://localhost:5000${j.companyLogo || ""}`,
            applicants: j.applicantsCount || 0,
            status: j.status || "active",
          }));
          setJobs(mappedJobs);
        }
      }
    } catch (error) {
      console.error("Error Closing the job:", error);
      setToast({
        message: "Failed to close the job",
        type: "error",
      });
    }
  };

  const stats = [
    {
      label: "Total Jobs",
      value: dashboardStats.totalJobs,
      icon: Briefcase,
      colors: statColors.blue,
    },
    {
      label: "Closed Jobs",
      value: dashboardStats.closeJobs,
      icon: Briefcase,
      colors: statColors.rose,
    },
    {
      label: "Total Applicants",
      value: dashboardStats.totalApplicants,
      icon: Users,
      colors: statColors.emerald,
    },
    {
      label: "Active Companies",
      value: dashboardStats.totalCompanies,
      icon: Building,
      colors: statColors.amber,
    },
  ];

  // to get unique company and role filter
  const uniqueCompanies = [...new Set(jobs.map((c) => c.name))];
  const uniqueRoles = [...new Set(jobs.map((c) => c.role))];

  // Filter jobs based on selected filters
  const filteredJobs = jobs.filter((job) => {
    const matchesCompany = companyFilter === "" || job.name === companyFilter;
    const matchesRole = roleFilter === "" || job.role === roleFilter;
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesCompany && matchesRole && matchesStatus;
  });

  // fallback for logo that failed to load
  const handleImageError = (e) => {
    e.target.style.display = "none";
    e.target.nextSibling?.classList.remove("hidden");
  };

  // clear all filters
  const clearFilters = () => {
    setCompanyFilter("");
    setRoleFilter("");
    setStatusFilter("active");
  };

  return (
    <div className={s.container}>
      {/* toast */}
      {toast && (
        <div className={s.toastWrapper}>
          <div
            className={`${s.toastBase}${toast.type === "success" ? s.toastSucess : toast.type === "error" ? s.toastError : s.toastDefault}`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={20} className={s.toastIconSuccess} />
            ) : (
              <XCircle
                size={20}
                className={
                  toast.type === "error" ? s.toastIconError : s.toastIconDefault
                }
              />
            )}
            <div className={s.toastFlex}>
              <p className={s.toastMessage}>{toast.message}</p>
              {toast.confirm && (
                <div className={s.toastButtonContainer}>
                  <button
                    onClick={handleConfirmClose}
                    className={s.toastConfirmBtn}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setToast(null)}
                    className={s.toastCancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {!toast.confirm && (
              <button
                onClick={() => setToast(null)}
                className={s.toastCloseBtn}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}
      <div className={s.contentWrapper}>
        <div className={s.headerContainer}>
          <div>
            <h1 className={s.headerTitle}>Job Portal Dashboard</h1>
            <p className={s.headerSubtitle}>
              <TrendingUp className={s.headerIcon} />
              <span>Real-Time overview of jobs and applicants</span>
            </p>
          </div>
        </div>
        {/* stats card */}
        <div className={s.statsGrid}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={s.statCard}>
                <div className={s.statCardOverlay}></div>
                <div className={s.statCardContent}>
                  <div className={s.statCardTextContainer}>
                    <p className={s.statCardLabel}>{stat.label}</p>
                    <p className={s.statCardValue}>{stat.value}</p>
                  </div>
                  <div
                    className={`${s.statCardIconWrapper} ${stat.colors.bgLight} bg-linear-to-br ${stat.colors.gradient}`}
                  >
                    <Icon className={s.statCardIcon} strokeWidth={1.8} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
