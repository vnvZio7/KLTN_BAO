import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const NavItem = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block px-3 py-2 rounded-lg text-sm font-medium ${
        isActive ? "bg-teal-600 text-white" : "text-gray-700 hover:bg-gray-100"
      }`
    }
  >
    {label}
  </NavLink>
);

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-14 bg-white shadow flex items-center px-4 justify-between">
        <div className="font-bold text-teal-700">Admin • MindCare+</div>
        <div className="text-sm text-gray-600">v1.0</div>
      </header>

      <div className="grid grid-cols-12">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 border-r bg-white px-3 py-4 space-y-2">
          <NavItem to="/admin/dashboard" label="📊 Dashboard" />
          <NavItem to="/admin/users" label="👤 Users" />
          <NavItem to="/admin/doctors" label="🩺 Doctors" />
          <NavItem to="/admin/appointments" label="📅 Appointments" />
          <NavItem to="/admin/screenings" label="📝 Screenings" />
        </aside>

        <main className="col-span-12 md:col-span-9 lg:col-span-10 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
