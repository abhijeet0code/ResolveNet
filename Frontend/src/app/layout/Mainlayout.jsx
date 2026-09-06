import React from 'react'
import Navbar from '../../components/Navbar'
import {Outlet} from 'react-router'
import Footer from '../../components/Footer'

const Mainlayout = () => {
  return (
    <div>
      <Navbar/>
      <main className='pt-16'><Outlet/></main>
      <Footer/>
      
      
    </div>
  )
}

export default Mainlayout
