import React from 'react'
import { Outlet } from 'react-router-dom'

const ProtectedLayout = () => {
  return (
    <div>
      <Outlet/>
    </div>
  )
}

export default ProtectedLayout
