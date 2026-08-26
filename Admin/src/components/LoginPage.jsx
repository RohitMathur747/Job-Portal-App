import React, { useEffect, useState } from "react";
import { loginPageStyles as s } from "../assets/dummyStyles";
import { useNavigate } from "react-router-dom";
import { axios } from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast({ visible: false, message: "", type: "success" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // to submit the data and logged in
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setToast({
        visible: true,
        message: "Please fill all fields",
        type: "error",
      });
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      if (res.data.user.role !== "admin") {
        setToast({
          visible: true,
          message: "Access Denied.Admin Only.",
          type: "error",
        });
        return;
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setToast({
        visible: true,
        message: "Login Successfull!",
        type: "success",
      });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      setToast({
        visible: true,
        message: "Invalid Email and Password",
        type: "error",
      });
    }
  };

  return <div className={s.pageContainer}></div>;
};

export default LoginPage;
