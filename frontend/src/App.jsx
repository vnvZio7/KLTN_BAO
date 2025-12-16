import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Guess/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import TestAndMatch from "./components/user/TestAndMatch";
import Page from "./pages/User/Page";
import DoctorPage from "./pages/Doctor/DoctorPage";
import AdminLayout from "./components/admin/AdminLayout";

import DoctorHomeworkPage from "./pages/User/Homework";
import PendingApproval from "./pages/Doctor/PendingApproval";
import DoctorListWithPayment from "./pages/User/features/DoctorListWithPayment";
import AdminPortal from "./pages/Admin/Admin";
import ProtectedRoute, {
  RequireDoctorApproved,
  RequireDoctorPending,
  RequireNoTest,
  RequireTestDone,
} from "./components/ProtectedRoute";
import VideoCallUser from "./components/VideoCallUser";
import VideoCallDoctor from "./components/VideoCallDoctor";
import ReTest from "./components/user/ReTest";
import Frozen from "./pages/Doctor/Frozen";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* USER */}
      <Route path="/retest" element={<ReTest />} />
      <Route element={<ProtectedRoute allow={["user"]} />}>
        <Route element={<RequireNoTest />}>
          <Route path="/test" element={<TestAndMatch />} />{" "}
        </Route>
        <Route element={<RequireTestDone />}>
          <Route path="/user" element={<Page />} />
          <Route path="/payment" element={<DoctorListWithPayment />} />
        </Route>
      </Route>
      {/* DOCTOR ROUTES */}
      <Route element={<ProtectedRoute allow={["doctor"]} />}>
        <Route element={<RequireDoctorApproved />}>
          <Route path="/doctor" element={<DoctorPage />} />{" "}
        </Route>
        <Route element={<RequireDoctorPending />}>
          <Route path="/pending" element={<PendingApproval />} />
        </Route>
        <Route path="/frozen" element={<Frozen />} />
      </Route>
      {/* ADMIN ROUTES */}
      <Route element={<ProtectedRoute allow={["admin"]} />}>
        <Route path="/admin-test" element={<AdminPortal />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
