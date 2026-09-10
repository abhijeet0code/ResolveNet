import React, { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Mainlayout from '../layout/Mainlayout'
import Home from '../../pages/Home'
import About from '../../pages/About'
import AuthLayout from '../layout/AuthLayout'
import Register from '../../features/auth/ui/Register'
import Login from '../../features/auth/ui/Login'
import { useDispatch } from "react-redux"
import { loggedUser } from '../../features/auth/state/authAction'

const AppRoute = () => {
  let dispatch =useDispatch()
  useEffect(() => {
  dispatch(loggedUser());   // 👈 () add kiya, pehle bina call ke bhej rahe the
}, []);
  let router=createBrowserRouter([
    {
      path:"/",
      element:<AuthLayout/>,
      children:[
        {
          path:"login",
          element:<Login/>
        },{
          path:"register",
          element:<Register/>
        }
      ]
    

    },
    {
      path:"/main",
      element:<Mainlayout/>,
      children:[
        {
          path:"",
          element:<Home/>
        },{
          path:"about",
          element:<About/>
        }
      ]
    }
  ])
  return <RouterProvider router={router}/>
}

export default AppRoute
