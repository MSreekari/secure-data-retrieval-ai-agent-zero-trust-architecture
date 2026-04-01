import React from 'react'
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  return (
    <div id = "home" className='flex min-h-[70vh] items-center justify-center'>
        <main className='flex flex-col items-center gap-6 text-center px-4'>
            <h1 className='text-white text-6xl font-sansflex max-w-4xl leading-tight'>Empowering AI Agents with <br />
            <span className='text-6xl font-sansflex bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent'>Secure, Context-Aware Access.</span>
            </h1>
            <p className='text-white text-2xl font-sansflex'>Every request is verified, every action is controlled, and every access is monitored.</p>
            <button onClick={() => navigate('/login')} className='flex cursor-pointer text-white bg-[#814AC8] hover:bg-white transition-colors hover:text-black rounded-4xl px-6 py-4'>
              Get Started 
              <span> <ArrowUpRight /> </span>
            </button>
        </main>
    </div>
  )
}
