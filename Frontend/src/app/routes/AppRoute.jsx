import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Mainlayout from "../layout/Mainlayout";
import Home from "../../pages/Home";
import About from "../../pages/About";
import AlexaPlusDemo from "../../pages/AlexaPlusDemo";
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
import ProfileSetupWizard from "../../components/ProfileSetup/ProfileSetupWizard ";
import DashHome from "../../features/dashboard/ui/pages/DashHome";
import Feed from "../../features/posts/ui/page/Feed";
import CreatePost from "../../features/posts/ui/components/CreatePost";
import SearchPage from "../../features/posts/ui/page/SearchPage";

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
        path: "alexa-plus",
        element: <AlexaPlusDemo />,
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
            element: <Feed />,
          },
          {
            path: "create",
            element: <CreatePost />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "profile-setup",
            element: <ProfileSetupWizard isEdit />,
          },
          {
            path: "search",
            element: <SearchPage/>,
          },
        ],
      },
    ],
  },
]);

  return <RouterProvider router={router} />;
  
};

export default AppRoute;
