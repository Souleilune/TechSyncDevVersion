// frontend/src/pages/Features.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Briefcase, Users, Brain, Rocket, BookOpen, Target, Network, BarChart3 } from 'lucide-react';

const Features = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const [isManualHover, setIsManualHover] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotate features every 4 seconds when not manually hovering
  useEffect(() => {
    if (!isManualHover) {
      const interval = setInterval(() => {
        setActiveFeature((prev) => (prev + 1) % 6);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isManualHover]);

  const features = [
    {
      icon: <Brain size={48} color="#60a5fa" />,
      title: "AI-Powered Matching",
      description: "Our intelligent algorithm analyzes your skills, experience, and preferences to match you with the perfect projects and team members.",
      benefits: ["Smart skill analysis", "Personalized recommendations", "Team chemistry optimization"],
      details: "Using advanced machine learning, we evaluate your technical skills, coding patterns, and collaboration preferences to find ideal project matches."
    },
    {
      icon: <Rocket size={48} color="#60a5fa" />,
      title: "Project Collaboration",
      description: "Create and join projects with powerful collaboration tools, real-time communication, and integrated development workflows.",
      benefits: ["Real-time collaboration", "Task management", "Code integration"],
      details: "Built-in tools for version control, issue tracking, and team communication keep your projects organized and moving forward."
    },
    {
      icon: <BookOpen size={48} color="#60a5fa" />,
      title: "Learning Pathways",
      description: "Failed a challenge? Get personalized learning resources and skill-building guidance to level up and try again.",
      benefits: ["Skill gap analysis", "Curated resources", "Progress tracking"],
      details: "Automated assessment identifies areas for improvement and provides tailored learning materials to help you succeed."
    },
    {
      icon: <Target size={48} color="#60a5fa" />,
      title: "Solo Development",
      description: "Work independently with AI-generated project ideas tailored to your skill level and learning goals.",
      benefits: ["Personalized projects", "Independent pace", "Skill development"],
      details: "Generate custom project ideas based on your interests and skill level, with guidance and resources to complete them successfully."
    },
    {
      icon: <Network size={48} color="#60a5fa" />,
      title: "Developer Network",
      description: "Connect with like-minded developers, build your professional network, and find mentors or collaborators.",
      benefits: ["Professional networking", "Mentorship opportunities", "Community building"],
      details: "Join a thriving community of developers where meaningful professional relationships form naturally through shared projects."
    },
    {
      icon: <BarChart3 size={48} color="#60a5fa" />,
      title: "Progress Analytics",
      description: "Track your growth, measure your contributions, and get insights into your development journey.",
      benefits: ["Performance metrics", "Growth tracking", "Achievement system"],
      details: "Comprehensive analytics show your coding progress, collaboration patterns, and areas where you're excelling or need improvement."
    }
  ];

  const useCases = [
    {
      title: "For Beginners",
      description: "Start your coding journey with guided projects and supportive teams",
      features: ["Beginner-friendly projects", "Mentorship matching", "Skill-building challenges"]
    },
    {
      title: "For Professionals",
      description: "Advance your career with challenging projects and industry connections",
      features: ["Advanced collaborations", "Portfolio building", "Professional networking"]
    },
    {
      title: "For Teams",
      description: "Find the right talent and build successful development teams",
      features: ["Team formation tools", "Skill assessment", "Project management"]
    }
  ];

  const handleFeatureHover = (index) => {
    setActiveFeature(index);
    setIsManualHover(true);
  };

  const handleFeatureLeave = () => {
    setIsManualHover(false);
  };

  const handleLearnMoreClick = () => {
    navigate("/"); // navigate to landing page
    setTimeout(() => {
      const target = document.getElementById("our-initiative");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
    }, 300); // wait for landing page to render
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    mouseEffect: {
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
    }
  };

  return (
    <div style={styles.pageContainer}>
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

          /* Navigation hover animations - matching LandingPage and DevelopersPage */
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
          
          .primary-cta:hover {
            background: #2d3035 !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(26, 28, 32, 0.3);
          }
          
          .secondary-cta:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
            transform: translateY(-2px);
          }
          
          .use-case-card:hover {
            transform: translateY(-4px) !important;
          }
          
          .feature-card {
            transition: all 0.3s ease !important;
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

      {/* Code symbols background */}
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
      
      <div style={styles.mouseEffect} />
      
      {/* Header */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem'
      }}>
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

      <main style={{
        position: 'relative',
        zIndex: 10,
        padding: '4rem 2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Hero Section */}
          <section style={{
            textAlign: 'center',
            marginBottom: '6rem'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #4b5563, #6b7280, #9ca3af, #eef0f4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Powerful Features
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#9ca3af',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Everything you need to collaborate effectively and grow as a developer
            </p>
          </section>

          {/* Features Grid */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
              marginBottom: '6rem'
            }}
            onMouseLeave={handleFeatureLeave}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card"
                style={{
                  background: 'rgba(26, 28, 32, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem',
                  cursor: 'pointer',
                  ...(index === activeFeature ? {
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    background: 'rgba(59, 130, 246, 0.05)',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)'
                  } : {})
                }}
                onMouseEnter={() => handleFeatureHover(index)}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>{feature.icon}</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: 'white'
                }}>{feature.title}</h3>
                <p style={{
                  color: '#d1d5db',
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}>{feature.description}</p>
                <p style={{
                  color: '#9ca3af',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  marginBottom: '1.5rem',
                  fontStyle: 'italic'
                }}>{feature.details}</p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#93c5fd',
                      fontSize: '0.9rem'
                    }}>
                      <span>✓</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Use Cases - Redesigned */}
          <section style={{
            marginBottom: '4rem',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: 'white'
            }}>Perfect for Every Developer</h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#9ca3af',
              maxWidth: '700px',
              margin: '0 auto 3rem auto',
              lineHeight: '1.6'
            }}>
              Whether you're just starting your coding journey, advancing your career, or building teams, TechSync adapts to your needs with personalized experiences and powerful collaboration tools.
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '3rem',
              flexWrap: 'wrap',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              <div style={{
                textAlign: 'center',
                maxWidth: '250px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  color: 'white'
                }}>
                  <Sprout size={32} />
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '0.75rem'
                }}>Beginners</h3>
                <p style={{
                  color: '#d1d5db',
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  Start with guided projects, find mentors, and build your first portfolio pieces
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                maxWidth: '250px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  color: 'white'
                }}>
                  <Briefcase size={32} />
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '0.75rem'
                }}>Professionals</h3>
                <p style={{
                  color: '#d1d5db',
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  Advance your career with challenging projects and professional networking
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                maxWidth: '250px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  color: 'white'
                }}>
                  <Users size={32} />
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '0.75rem'
                }}>Teams</h3>
                <p style={{
                  color: '#d1d5db',
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  Find the right talent and build successful development teams quickly
                </p>
              </div>
            </div>
          </section>

          {/* Simple Call to Action */}
          <section style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: 'white'
            }}>Ready to Get Started?</h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#9ca3af',
              marginBottom: '2rem'
            }}>
              Join developers building amazing projects together
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <button 
                style={{
                  background: '#1A1C20',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                className="primary-cta"
                onClick={() => navigate('/login?mode=signup')}
              >
                Start Building
              </button>
              <button 
                style={{
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  background: 'transparent',
                  color: 'white',
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                className="secondary-cta"
                onClick={handleLearnMoreClick}
              >
                Learn More
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'transparent',
        borderTop: 'none',
        paddingTop: 0
      }}>
        <div style={{
          padding: '1rem 2rem',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          marginTop: '2rem'
        }}>
          <p style={{
            color: '#9ca3af',
            fontSize: '0.875rem',
            margin: 0
          }}>© 2025 TechSync. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Features;