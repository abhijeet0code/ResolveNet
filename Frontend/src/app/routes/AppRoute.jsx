<<<<<<< HEAD
import React from "react";
import { createBrowserRouter,RouterProvider,} from "react-router-dom";

import Mainlayout from "../layout/Mainlayout";
import Home from "../../pages/Home";
import About from "../../pages/About";

import AuthLayout from "../layout/AuthLayout";
import Register from "../../features/auth/ui/Register";
import Login from "../../features/auth/ui/Login";
import AuthCallback from "../../features/auth/ui/AuthCallback";
=======
import React, { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Mainlayout from '../layout/Mainlayout'
import Home from '../../pages/Home'
import About from '../../pages/About'
import AuthLayout from '../layout/AuthLayout'
import Register from '../../features/auth/ui/Register'
import Login from '../../features/auth/ui/Login'
import AuthCallback from '../../features/auth/ui/AuthCallback'
// import { useDispatch } from "react-redux"
// import { loggedUser } from '../../features/auth/state/authAction'
>>>>>>> 1c25876f34c419c95d1485c3e49b00dc2ee2238f

const AppRoute = () => {
  const router = createBrowserRouter([
    {
<<<<<<< HEAD
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
=======
      path:"/auth/callback",
      element:<AuthCallback/>
    }
    ,
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
>>>>>>> 1c25876f34c419c95d1485c3e49b00dc2ee2238f
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

<<<<<<< HEAD
export default AppRoute;
=======
export default AppRoute;
>>>>>>> 1c25876f34c419c95d1485c3e49b00dc2ee2238f
