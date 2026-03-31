import React from 'react'
import Navbar from '../components/Navbar'
import { Home } from '../components/Home'
import Services from '../components/Services'

const HomePage = () => {
  return (
    <div className='min-h-screen bg-gradient-to-b from-[#0D0D0D] to-[#000000]'>
        <Navbar />
        <Home /> 
        <Services /> 
    </div>
  )
}

export {HomePage}