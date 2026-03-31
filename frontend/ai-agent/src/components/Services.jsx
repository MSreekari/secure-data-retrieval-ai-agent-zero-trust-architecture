import React from 'react'
const services = [
    {
        category : "Agent Identity", 
        title : "Real-Time Authentication Control", 
        description : "Ensure every AI agent is verified before access, using strong identity validation and role assignment mechanisms.", 
        tags : ["Secure Login", "Identity Verification", "Role Mapping"]
    }, 
    {
        category : "Access Governance", 
        title : "Policy-Based Authorization Engine", 
        description : "Define and enforce granular policies that control which resources each agent can access based on assigned roles.", 
        tags : ["Role Enforcement", "Policy Rules", "Access Control"]
    }, 
    {
        category : "Threat Monitoring", 
        title : "Continuous Risk & Activity Tracking", 
        description : "Monitor every interaction in real time, detect unusual behavior, and calculate dynamic risk scores for each request.", 
        tags : ["Risk Scoring", "Activity Logs", "Anomaly Detection"]
    }, 
    {
        category : "Enforcement Layer", 
        title : "Secure Policy Enforcement Gateway", 
        description : "Act as a central control point that validates, authorizes, and securely routes every AI agent request across the system.", 
        tags : ["Request Validation", "Decision Enforcement", "Secure Routing"]
    }
]; 
const Services = () => {
  return (
    <section id = "services" className='scroll-mt-20 flex flex-col min-h-screen items-center justify-center gap-4'>
        <span className='text-white font-medium px-4 py-1.5 rounded-full border border-zinc-700 bg-zinc-900/50 hover:border-indigo-500 hover:text-white transition-colors duration-300 cursor-default'>Our Services</span>
        <div className='max-w-6xl text-center space-y-4'>
            <h1 className='text-white font-sansflex text-5xl tracking-tight leading-tight'>Policy-driven security for <br />
                <span className='text-white font-sansflex text-5xl bg-clip-text'>authenticated, authorized, and monitored AI access</span>
            </h1>
        </div>
        <div className="flex flex-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
            <div key={index} className="lex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-24">
      
                <span className="text-xs font-sansflex text-indigo-400 uppercase tracking-widest">
                    {service.category}
                </span>
      
                <h2 className="text-2xl font-sansflex text-white">
                    {service.title}
                </h2>

                <h3 className="text-2xl font-sansflex text-white">
                    {service.description}
                </h3>
      
                {/* 3. Info Tags (Two or three words with rounded-full) */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {service.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 text-xs font-sansflex text-zinc-400 border border-zinc-700 rounded-full bg-zinc-800/50">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
        ))}
    </div>
    </section>
  )
}

export default Services