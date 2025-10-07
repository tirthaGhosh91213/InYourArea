// src/pages/NotFound.jsx
import React from "react";
import { AlertCircle } from "lucide-react"; // Neon alert icon

export default function NotFound() {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col justify-center items-center font-poppins text-white">

      {/* Animated Particle Grid Background */}
      <div className="absolute inset-0 flex flex-wrap">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 bg-green-400 opacity-30 animate-pulseParticle"
            style={{ animationDelay: `${Math.random() * 2}s` }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Icon */}
        <AlertCircle className="mx-auto mb-6 w-20 h-20 text-green-400 animate-bounce" />

        {/* Glitch 404 Text */}
        <h1 className="text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-300 to-green-500 relative inline-block animate-glitch">
          404
          <span className="absolute top-0 left-1 text-green-400 opacity-50">404</span>
          <span className="absolute top-0 -left-1 text-green-300 opacity-50">404</span>
        </h1>

        <p className="text-3xl mt-4 mb-6 tracking-wider animate-fadeInUp">Oops! Page Not Found</p>
        <p className="text-gray-300 max-w-lg mx-auto mb-10 animate-fadeInDelay">
          The page you are looking for might have been removed, changed, or is temporarily unavailable.
        </p>

        {/* Neon Green Button */}
        <a
          href="/"
          className="relative px-10 py-4 font-bold rounded-full bg-green-500 text-white shadow-[0_0_20px_#00ff7f,0_0_40px_#00ff7f] 
                     hover:scale-110 hover:shadow-[0_0_40px_#00ff7f,0_0_80px_#00ff7f] transition-all duration-300 
                     after:content-[''] after:absolute after:inset-0 after:rounded-full after:border-2 after:border-green-500 after:opacity-20 after:blur-xl after:animate-pingNeon"
        >
          Go Back Home
        </a>
      </div>

      {/* Tailwind Custom Animations */}
      <style jsx>{`
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-5px, 5px); }
          40% { transform: translate(5px, -5px); }
          60% { transform: translate(-5px, 5px); }
          80% { transform: translate(5px, -5px); }
          100% { transform: translate(0); }
        }
        .animate-glitch {
          animation: glitch 1s infinite;
        }

        @keyframes fadeInUp { 
          0% { opacity: 0; transform: translateY(20px); } 
          100% { opacity: 1; transform: translateY(0); } 
        }
        .animate-fadeInUp { animation: fadeInUp 1s ease-out forwards; }
        .animate-fadeInDelay { animation: fadeInUp 1.5s ease-out forwards; }

        @keyframes pingNeon {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .animate-pingNeon { animation: pingNeon 2s infinite; }

        @keyframes pulseParticle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        .animate-pulseParticle { animation: pulseParticle 3s infinite; }
      `}</style>
    </div>
  );
}
