import React from 'react'

const Navbar = () => {
  return (
    <div className='flex items-center justify-between'>
        <div className=''>
            <h1 className='font-sansflex text-5xl text-white'>Secure AI</h1>
            {/* <p className='font-coolvetica text-white text-1xl md:text-1xl'>Zero Trust Orchestration</p> */}
        </div>
        <nav className='text-white flex items-center gap-8 text-1.5xl'>
            <a href="#home" className='hover:text-[#814AC8]'>Home</a>
            <a href="#services" className='hover:text-[#814AC8]'>Services</a>
            <a href="/process" className='hover:text-[#814AC8]'>Process</a>
            <a href="/getstarted" className='hover:text-[#814AC8]'>Get Started</a>
        </nav>
    </div>
  )
}

export default Navbar