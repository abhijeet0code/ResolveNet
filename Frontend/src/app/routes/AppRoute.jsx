import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Mainlayout from "../layout/Mainlayout";
import Home from "../../pages/Home";
import About from "../../pages/About";
import AuthLayout from "../layout/AuthLayout";
import Register from "../../features/auth/ui/Register";
import Login from "../../features/auth/ui/Login";
import AuthCallback from "../../features/auth/ui/AuthCallback";
import { useDispatch } from "react-redux";
import { loggedUser } from "../../features/auth/state/authAction";
import PublicLayout from "../layout/PublicLayout";
import ProtectedLayout from "../protected/ProtectedLayout";
import DashboardLayout from "../layout/DashboardLayout";
import Profile from "../../features/dashboard/ui/components/Profile";

const AppRoute = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loggedUser());
  }, []);

  const router = createBrowserRouter([
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        element: <Mainlayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "about",
            element: <About />,
          },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
          },
        ],
      },
    ],
  },
  {
    path: "/dashboard",
    element: <ProtectedLayout />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Profile />,
          },
          // more dashboard routes here, e.g.:
          // { path: "reports", element: <Reports /> },
          // { path: "complaints", element: <Complaints /> },
        ],
      },
    ],
  },
]);

  return <RouterProvider router={router} />;
};

export default AppRoute;