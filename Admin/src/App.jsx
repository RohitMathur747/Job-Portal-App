//import React from "react";

import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AddJobs from "./pages/AddJobs";

const App = () => {
  return (
    <div>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/addjobs" element={<AddJobs />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
