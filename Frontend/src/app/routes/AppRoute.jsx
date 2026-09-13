import React from "react";
import { createBrowserRouter,RouterProvider,} from "react-router-dom";

import Mainlayout from "../layout/Mainlayout";
import Home from "../../pages/Home";
import About from "../../pages/About";

import AuthLayout from "../layout/AuthLayout";
import Register from "../../features/auth/ui/Register";
import Login from "../../features/auth/ui/Login";
import AuthCallback from "../../features/auth/ui/AuthCallback";

const AppRoute = () => {
  const router = createBrowserRouter([
    {
      path: "/auth/callback",
      element: <AuthCallback />,
    },

    {
      path: "/",
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

    {
      path: "/main",
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
  ]);

  return <RouterProvider router={router} />;
};

export default AppRoute;