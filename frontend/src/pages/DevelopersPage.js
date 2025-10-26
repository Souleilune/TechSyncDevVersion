import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Mail } from "lucide-react";

const DevelopersPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState(null);
  const [visibleCards, setVisibleCards] = useState([]);

  // Mouse tracking effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fade-in animation effect
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setVisibleCards(prev => [...prev, 1]);
    }, 300);

    const timer2 = setTimeout(() => {
      setVisibleCards(prev => [...prev, 2]);
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Developer data - replace with your actual information
  const developers = [
    {
      id: 1,
      name: "Virgil D. Barcelon",
      role: "Full-Stack Developer",
      bio: "Passionate about creating seamless user experiences and robust backend systems. Specializes in React, Node.js, and cloud architecture.",
      image: "/images/developers/developer1.png",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker"],
      social: {
        github: "https://github.com/Souleilune",
        linkedin: "https://www.linkedin.com/in/virgil-barcelon-066a42312/",
        email: "virgildelacruz15@gmail.com"
      },
      achievements: [
        "Built scalable microservices architecture",
        "Led frontend development team",
        "Open source contributor"
      ],
      quote: "Code is poetry written in logic."
    },
    {
      id: 2,
      name: "Khristian Angelo E. Tiu", 
      role: "Frontend Developer & Project Manager",
      bio: "Expert in system design and infrastructure automation. Focused on performance optimization and scalable distributed systems.",
      image: "/images/developers/developer2.jpg",
      skills: ["Java", "C++", "Web Development", "MySQL", "React", "Node.js"],
      social: {
        github: "https://github.com/khristianangelo18",
        linkedin: "https://www.linkedin.com/in/khristian-angelo-tiu-878863312/",
        email: "khristianangelo.tiu@gmail.com"
      },
      achievements: [
        "Optimized system performance by 300%",
        "Implemented CI/CD pipelines",
        "Database architecture specialist"
      ],
      quote: "Great software is built on great architecture."
    }
  ];

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleContactClick = () => {
    navigate('/login?mode=signup');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>
        {`
          /* FLOATING BACKGROUND SYMBOLS */
          @keyframes floatAround1 {
            0%, 100% { transform: translate(0, 0) rotate(-10.79deg); }
            25% { transform: translate(30px, -20px) rotate(-5deg); }
            50% { transform: translate(-15px, 25px) rotate(-15deg); }
            75% { transform: translate(20px, 10px) rotate(-8deg); }
          }

          @keyframes floatAround2 {
            0%, 100% { transform: translate(0, 0) rotate(-37.99deg); }
            33% { transform: translate(-25px, 15px) rotate(-30deg); }
            66% { transform: translate(35px, -10px) rotate(-45deg); }
          }

          @keyframes floatAround3 {
            0%, 100% { transform: translate(0, 0) rotate(34.77deg); }
            20% { transform: translate(-20px, -30px) rotate(40deg); }
            40% { transform: translate(25px, 20px) rotate(28deg); }
            60% { transform: translate(-10px, -15px) rotate(38deg); }
            80% { transform: translate(15px, 25px) rotate(30deg); }
          }

          @keyframes floatAround4 {
            0%, 100% { transform: translate(0, 0) rotate(28.16deg); }
            50% { transform: translate(-40px, 30px) rotate(35deg); }
          }

          @keyframes floatAround5 {
            0%, 100% { transform: translate(0, 0) rotate(24.5deg); }
            25% { transform: translate(20px, -25px) rotate(30deg); }
            50% { transform: translate(-30px, 20px) rotate(18deg); }
            75% { transform: translate(25px, 15px) rotate(28deg); }
          }

          @keyframes floatAround6 {
            0%, 100% { transform: translate(0, 0) rotate(25.29deg); }
            33% { transform: translate(-15px, -20px) rotate(30deg); }
            66% { transform: translate(30px, 25px) rotate(20deg); }
          }

          @keyframes driftSlow {
            0%, 100% { transform: translate(0, 0) rotate(-19.68deg); }
            25% { transform: translate(-35px, 20px) rotate(-25deg); }
            50% { transform: translate(20px, -30px) rotate(-15deg); }
            75% { transform: translate(-10px, 35px) rotate(-22deg); }
          }

          @keyframes gentleDrift {
            0%, 100% { transform: translate(0, 0) rotate(-6.83deg); }
            50% { transform: translate(25px, -40px) rotate(-2deg); }
          }

          @keyframes spiralFloat {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(20px, -20px) rotate(5deg); }
            50% { transform: translate(0px, -40px) rotate(10deg); }
            75% { transform: translate(-20px, -20px) rotate(5deg); }
          }

          @keyframes waveMotion {
            0%, 100% { transform: translate(0, 0) rotate(15deg); }
            25% { transform: translate(30px, 10px) rotate(20deg); }
            50% { transform: translate(15px, -25px) rotate(10deg); }
            75% { transform: translate(-15px, 10px) rotate(18deg); }
          }

          @keyframes circularDrift {
            0%, 100% { transform: translate(0, 0) rotate(-45deg); }
            25% { transform: translate(25px, 0px) rotate(-40deg); }
            50% { transform: translate(25px, 25px) rotate(-50deg); }
            75% { transform: translate(0px, 25px) rotate(-42deg); }
          }

          .floating-symbol {
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
          }

          .floating-symbol:nth-child(1) { animation: floatAround1 15s infinite; }
          .floating-symbol:nth-child(2) { animation: floatAround2 18s infinite; animation-delay: -2s; }
          .floating-symbol:nth-child(3) { animation: floatAround3 12s infinite; animation-delay: -5s; }
          .floating-symbol:nth-child(4) { animation: floatAround4 20s infinite; animation-delay: -8s; }
          .floating-symbol:nth-child(5) { animation: floatAround5 16s infinite; animation-delay: -3s; }
          .floating-symbol:nth-child(6) { animation: floatAround6 14s infinite; animation-delay: -7s; }
          .floating-symbol:nth-child(7) { animation: driftSlow 22s infinite; animation-delay: -10s; }
          .floating-symbol:nth-child(8) { animation: gentleDrift 19s infinite; animation-delay: -1s; }
          .floating-symbol:nth-child(9) { animation: spiralFloat 17s infinite; animation-delay: -6s; }
          .floating-symbol:nth-child(10) { animation: waveMotion 13s infinite; animation-delay: -4s; }
          .floating-symbol:nth-child(11) { animation: circularDrift 21s infinite; animation-delay: -9s; }
          .floating-symbol:nth-child(12) { animation: floatAround1 16s infinite; animation-delay: -2s; }
          .floating-symbol:nth-child(13) { animation: floatAround2 18s infinite; animation-delay: -11s; }
          .floating-symbol:nth-child(14) { animation: floatAround3 14s infinite; animation-delay: -5s; }
          .floating-symbol:nth-child(15) { animation: floatAround4 19s infinite; animation-delay: -7s; }
          .floating-symbol:nth-child(16) { animation: floatAround5 23s infinite; animation-delay: -3s; }
          .floating-symbol:nth-child(17) { animation: driftSlow 15s infinite; animation-delay: -8s; }
          .floating-symbol:nth-child(18) { animation: gentleDrift 17s infinite; animation-delay: -1s; }
          .floating-symbol:nth-child(19) { animation: spiralFloat 20s infinite; animation-delay: -12s; }
          .floating-symbol:nth-child(20) { animation: waveMotion 18s infinite; animation-delay: -6s; }
          .floating-symbol:nth-child(21) { animation: circularDrift 16s infinite; animation-delay: -4s; }
          .floating-symbol:nth-child(22) { animation: floatAround1 14s infinite; animation-delay: -9s; }
          .floating-symbol:nth-child(23) { animation: floatAround2 16s infinite; animation-delay: -3s; }
          .floating-symbol:nth-child(24) { animation: driftSlow 18s infinite; animation-delay: -7s; }

          /* Navigation hover animations - matching LandingPage */
          .nav-link:hover {
            color: #1f2937 !important;
            transform: translateY(-2px);
          }
          
          .login-btn:hover {
            color: #ffffff !important;
            transform: translateY(-2px);
          }
          
          .signup-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          /* Developer card hover animations */
          .dev-card:hover {
            transform: translateY(-8px) !important;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4) !important;
          }
          
          .skill-tag:hover {
            background: rgba(59, 130, 246, 0.8) !important;
            transform: translateY(-2px) !important;
          }
          
          .social-link:hover {
            transform: translateY(-2px) scale(1.1) !important;
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3) !important;
          }
          
          .back-button:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            transform: translateY(-2px) !important;
          }
          
          .contact-button:hover {
            background: #2563eb !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3) !important;
          }
          
          .achievement-item:hover {
            background: rgba(255, 255, 255, 0.08) !important;
            transform: translateX(8px) !important;
          }

          /* Fade-in animations */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(60px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: translateY(40px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .fade-in-card {
            animation: fadeInScale 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          .card-hidden {
            opacity: 0;
            transform: translateY(60px) scale(0.9);
          }
        `}
      </style>

      {/* Background Elements */}
      <svg 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
        viewBox="0 0 1440 1024"
        preserveAspectRatio="none"
      >
        <path
          d="M0,400 Q200,300 400,350 T800,320 Q1000,280 1200,340 L1440,360 L1440,1024 L0,1024 Z"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          opacity={0.02}
        />
        <path
          d="M0,600 Q300,500 600,550 T1200,520 L1440,540 L1440,1024 L0,1024 Z"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          opacity={0.015}
        />
      </svg>

      {/* Code symbols background - FULL DENSITY MATCHING LANDING PAGE */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '78%', top: '85%', color: '#3E4A6B', transform: 'rotate(-25deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '58%', top: '75%', color: '#6D798F', transform: 'rotate(10deg)'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            position: 'absolute',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '29px',
            userSelect: 'none',
            pointerEvents: 'none',
            left: '35%', top: '5%', color: '#454B68', transform: 'rotate(-35deg)'
          }}>&#60;/&#62;</div>
        </div>
      </div>

      {/* Mouse follow effect */}
      <div 
        style={{
          position: 'fixed',
          width: '384px',
          height: '384px',
          borderRadius: '50%',
          pointerEvents: 'none',
          opacity: 0.08,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          zIndex: 3,
          left: mousePosition.x - 192,
          top: mousePosition.y - 192
        }}
      />

      {/* Header */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem'
        }}>
        {/* Logo + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img 
            src="/images/logo/TechSyncLogo.png"
            alt="TechSync Logo"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain'
            }}
          />
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            letterSpacing: '-0.025em',
            background: 'linear-gradient(135deg, #4b5563, #6b7280, #9ca3af, #eef0f4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>TechSync</span>
        </div>

        {/* Nav Bar */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          background: 'white',
          backdropFilter: 'blur(8px)',
          borderRadius: '0 0 20px 20px',
          padding: '0.75rem 1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <span 
            onClick={() => navigate('/')} 
            style={{
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.3s ease, transform 0.3s ease',
              cursor: 'pointer'
            }} 
            className="nav-link"
          >
            HOME
          </span>
          
          <span 
            onClick={() => navigate('/features')} 
            style={{
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.3s ease, transform 0.3s ease',
              cursor: 'pointer'
            }} 
            className="nav-link"
          >
            FEATURES
          </span>

          <span 
            onClick={() => navigate('/aboutpage')} 
            style={{
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.3s ease, transform 0.3s ease',
              cursor: 'pointer'
            }} 
            className="nav-link"
          >
            ABOUT
          </span>

          <span 
            onClick={() => navigate('/developerspage')} 
            style={{
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.3s ease, transform 0.3s ease',
              cursor: 'pointer'
            }} 
            className="nav-link"
          >
            DEVELOPERS
          </span>
        </nav>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={{
            color: '#d1d5db',
            background: 'none',
            border: 'none',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'color 0.3s ease, transform 0.3s ease',
            padding: '0.5rem 1rem',
            fontSize: '16px'
          }} className="login-btn" onClick={() => navigate('/login')}>
            Login
          </button>
          <button style={{
            background: 'linear-gradient(to right, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: '9999px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '16px'
          }} className="signup-btn" onClick={() => navigate('/login?mode=signup')}>
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        position: 'relative',
        zIndex: 10,
        padding: '0 3rem 3rem 3rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #4b5563, #6b7280, #9ca3af, #eef0f4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Meet Our Developers
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#9ca3af',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            The passionate minds behind TechSync, dedicated to building the future of collaborative development.
          </p>
        </div>

        {/* Developer Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '3rem',
          marginBottom: '4rem'
        }}>
          {developers.map((dev) => (
            <div
              key={dev.id}
              className={`dev-card ${visibleCards.includes(dev.id) ? 'fade-in-card' : 'card-hidden'}`}
              style={{
                background: 'rgba(26, 28, 32, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '2.5rem',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={() => setActiveCard(dev.id)}
              onMouseLeave={() => setActiveCard(null)}
            >
              {/* Card Background Effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: activeCard === dev.id 
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05))'
                  : 'transparent',
                transition: 'all 0.4s ease',
                zIndex: 1
              }} />

              <div style={{ position: 'relative', zIndex: 2 }}>
                {/* Developer Image */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #60a5fa, #a855f7)',
                  padding: '4px',
                  margin: '0 auto 2rem auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '112px',
                    height: '112px',
                    borderRadius: '50%',
                    background: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    overflow: 'hidden'
                  }}>
                    {dev.image && !dev.image.includes('placeholder') ? (
                      <img 
                        src={dev.image} 
                        alt={dev.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = dev.name.split(' ').map(n => n[0]).join('');
                        }}
                      />
                    ) : (
                      dev.name.split(' ').map(n => n[0]).join('')
                    )}
                  </div>
                </div>

                {/* Developer Info */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '0.5rem'
                  }}>
                    {dev.name}
                  </h3>
                  <p style={{
                    fontSize: '1.125rem',
                    color: '#60a5fa',
                    fontWeight: '500',
                    marginBottom: '1rem'
                  }}>
                    {dev.role}
                  </p>
                  <p style={{
                    color: '#d1d5db',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem'
                  }}>
                    {dev.bio}
                  </p>
                  <blockquote style={{
                    fontStyle: 'italic',
                    color: '#9ca3af',
                    fontSize: '0.95rem',
                    borderLeft: '3px solid #3b82f6',
                    paddingLeft: '1rem',
                    textAlign: 'left'
                  }}>
                    "{dev.quote}"
                  </blockquote>
                </div>

                {/* Skills */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    Technical Skills
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    justifyContent: 'center'
                  }}>
                    {dev.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="skill-tag"
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#93c5fd',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    Key Achievements
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {dev.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="achievement-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{
                          width: '6px',
                          height: '6px',
                          background: '#22c55e',
                          borderRadius: '50%',
                          flexShrink: 0
                        }} />
                        <span style={{
                          color: '#e5e7eb',
                          fontSize: '0.9rem'
                        }}>
                          {achievement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem'
                }}>
                  {/* GitHub */}
                  <a
                    href={dev.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Github size={22} />
                  </a>

                  {/* LinkedIn */}
                  <a
                    href={dev.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Linkedin size={22} />
                  </a>

                  {/* Gmail */}
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${dev.social.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Mail size={22} />
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          background: 'rgba(26, 28, 32, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          marginTop: '2rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem'
          }}>
            Ready to Connect with Us?
          </h2>
          <p style={{
            color: '#9ca3af',
            fontSize: '1.125rem',
            marginBottom: '2rem',
            maxWidth: '500px',
            margin: '0 auto 2rem auto'
          }}>
            Join TechSync and be part of our growing community of passionate developers.
          </p>
          <button
            onClick={handleContactClick}
            className="contact-button"
            style={{
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              padding: '1rem 2.5rem',
              borderRadius: '50px',
              fontSize: '1.125rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Get Started Today
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        padding: '2rem 3rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <p style={{
          color: '#9ca3af',
          fontSize: '0.875rem',
          margin: 0
        }}>
          © 2025 TechSync. Built with passion by our amazing team.
        </p>
      </footer>
    </div>
  );
};

export default DevelopersPage;