// frontend/src/pages/About.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Handshake, TrendingUp, Microscope } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const values = [
    {
      icon: (
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <Target size={40} color="white" />
        </div>
      ),
      title: "Purpose-Driven",
      description: "Every feature we build serves a clear purpose: helping developers find meaningful collaboration and accelerate their growth."
    },
    {
      icon: (
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <Handshake size={40} color="white" />
        </div>
      ),
      title: "Community First", 
      description: "We believe in the power of community. Great software is built by great teams, and great teams are built on trust and shared values."
    },
    {
      icon: (
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <TrendingUp size={40} color="white" />
        </div>
      ),
      title: "Continuous Growth",
      description: "Learning never stops. We provide the tools and environment for developers to continuously improve and reach their full potential."
    },
    {
      icon: (
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <Microscope size={40} color="white" />
        </div>
      ),
      title: "Innovation",
      description: "We leverage cutting-edge AI and machine learning to solve real problems in developer collaboration and team formation."
    }
  ];

  const principles = [
    {
      title: "Transparency",
      description: "We believe in open communication about how our algorithms work and why certain matches are suggested."
    },
    {
      title: "Inclusivity",
      description: "TechSync is designed to welcome developers of all backgrounds, skill levels, and experience ranges."
    },
    {
      title: "Quality",
      description: "We prioritize meaningful connections over quantity, ensuring every match has the potential for success."
    },
    {
      title: "Privacy",
      description: "Your data is protected and used solely to improve your experience and match quality on our platform."
    }
  ];

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
    },
    header: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    logoIcon: {
      width: '32px',
      height: '32px',
      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      borderRadius: '4px',
      transform: 'rotate(45deg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    logoInner: {
      width: '16px',
      height: '16px',
      background: 'white',
      borderRadius: '2px',
      transform: 'rotate(-45deg)'
    },
    logoText: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      letterSpacing: '-0.025em'
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      background: 'white',
      backdropFilter: 'blur(8px)',
      borderRadius: '0 0 20px 20px',
      padding: '0.75rem 1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    navLink: {
      color: '#374151',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'color 0.3s ease, transform 0.3s ease',
      cursor: 'pointer'
    },
    authButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    loginBtn: {
      color: '#d1d5db',
      background: 'none',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'color 0.3s ease, transform 0.3s ease',
      padding: '0.5rem 1rem',
      fontSize: '16px'
    },
    signupBtn: {
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1.5rem',
      borderRadius: '9999px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '16px'
    },
    main: {
      position: 'relative',
      zIndex: 10,
      padding: '4rem 2rem'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    heroSection: {
      textAlign: 'center',
      marginBottom: '6rem'
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      background: 'linear-gradient(135deg, #4b5563, #6b7280, #9ca3af, #eef0f4ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      color: '#9ca3af',
      maxWidth: '800px',
      margin: '0 auto'
    },
    section: {
      marginBottom: '6rem'
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '2rem',
      textAlign: 'center',
      color: 'white'
    },
    missionContainer: {
      textAlign: 'center',
      maxWidth: '800px',
      margin: '0 auto',
      marginBottom: '4rem'
    },
    missionText: {
      fontSize: '1.25rem',
      color: '#e5e7eb',
      lineHeight: '1.8',
      marginBottom: '2rem'
    },
    valuesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem'
    },
    valueCard: {
      textAlign: 'center',
      padding: '2rem',
      background: 'rgba(26, 28, 32, 0.6)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'transform 0.3s ease'
    },
    valueTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: 'white'
    },
    valueDescription: {
      color: '#9ca3af',
      lineHeight: '1.6'
    },
    principlesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem'
    },
    principleCard: {
      padding: '2rem',
      background: 'rgba(26, 28, 32, 0.6)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease'
    },
    principleTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#60a5fa'
    },
    principleDescription: {
      color: '#d1d5db',
      lineHeight: '1.6'
    },
    visionSection: {
      textAlign: 'center',
      marginBottom: '6rem'
    },
    visionTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '2rem',
      background: 'White',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    visionText: {
      fontSize: '1.25rem',
      color: '#9ca3af',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.8',
      marginBottom: '2rem'
    },
    ctaSection: {
      textAlign: 'center',
      padding: '2rem 1rem',
      marginTop: '4rem'
    },
    ctaTitle: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: 'white'
    },
    ctaSubtitle: {
      fontSize: '1rem',
      color: '#9ca3af',
      marginBottom: '1.5rem'
    },
    ctaButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      flexWrap: 'wrap'
    },
    primaryCta: {
      background: '#1A1C20',
      color: 'white',
      border: 'none',
      padding: '0.75rem 2rem',
      borderRadius: '6px',
      fontWeight: 600,
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    secondaryCta: {
      border: '2px solid rgba(255, 255, 255, 0.3)',
      background: 'transparent',
      color: 'white',
      padding: '0.75rem 2rem',
      borderRadius: '6px',
      fontWeight: 600,
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)'
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
          
          .value-card:hover {
            transform: translateY(-4px) !important;
          }
          
          .principle-card:hover {
            transform: translateY(-4px) !important;
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
      <header style={styles.header}>
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

        <nav style={styles.nav}>
          <span style={styles.navLink} className="nav-link" onClick={() => navigate('/')}>HOME</span>
          <span style={styles.navLink} className="nav-link" onClick={() => navigate('/features')}>FEATURES</span>
          <span style={styles.navLink} className="nav-link" onClick={() => navigate('/aboutpage')}>ABOUT</span>
          <span style={styles.navLink} className="nav-link" onClick={() => navigate('/developerspage')}>DEVELOPERS</span>
        </nav>

        <div style={styles.authButtons}>
          <button style={styles.loginBtn} className="login-btn" onClick={() => navigate('/login')}>Login</button>
          <button style={styles.signupBtn} className="signup-btn" onClick={() => navigate('/login?mode=signup')}>Sign Up</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.container}>
          {/* Hero Section */}
          <section style={styles.heroSection}>
            <h1 style={styles.heroTitle}>About &lt;TechSync/&gt;</h1>
            <p style={styles.heroSubtitle}>
              We're building the future of developer collaboration through intelligent matching, personalized learning, and meaningful connections.
            </p>
          </section>

          {/* Mission */}
          <section style={styles.section}>
            <div style={styles.missionContainer}>
              <p style={styles.missionText}>
                TechSync was born from a simple observation: finding the right collaborators for your coding projects shouldn't be left to chance. We're building the future of developer collaboration through intelligent matching, personalized learning, and meaningful connections.
              </p>
              <p style={styles.missionText}>
                Our mission is to eliminate the frustration of mismatched teams and wasted potential by creating a platform where every developer can find their perfect project match and grow alongside like-minded peers.
              </p>
            </div>
          </section>

          {/* Core Values */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Our Core Values</h2>
            <div style={styles.valuesGrid}>
              {values.map((value, index) => (
                <div 
                  key={index} 
                  style={styles.valueCard}
                  className="value-card"
                >
                  {value.icon}
                  <h3 style={styles.valueTitle}>{value.title}</h3>
                  <p style={styles.valueDescription}>{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Principles */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Our Principles</h2>
            <p style={{
              textAlign: 'center',
              fontSize: '1.125rem',
              color: '#9ca3af',
              marginBottom: '4rem',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 4rem auto'
            }}>
              These core principles guide every decision we make and every feature we build at TechSync.
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {principles.map((principle, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '2rem',
                  padding: '2rem',
                  background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.05), rgba(59, 130, 246, 0.02))',
                  borderRadius: '16px',
                  border: '1px solid rgba(96, 165, 250, 0.1)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="principle-card"
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: 'linear-gradient(to bottom, #60a5fa, #3b82f6)'
                  }} />
                  
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.375rem',
                      fontWeight: 'bold',
                      color: 'white',
                      marginBottom: '0.75rem'
                    }}>
                      {principle.title}
                    </h3>
                    <p style={{
                      color: '#d1d5db',
                      fontSize: '1rem',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {principle.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Vision Statement */}
          <section style={styles.visionSection}>
            <h2 style={styles.visionTitle}>Our Vision</h2>
            <p style={styles.visionText}>
              We envision a world where every developer can easily find their ideal collaborators, where skill gaps become learning opportunities, and where meaningful professional relationships form naturally through shared passion for technology.
            </p>
            <p style={styles.visionText}>
              TechSync isn't just a platform—it's a movement toward more intentional, more successful, and more fulfilling developer collaboration.
            </p>
          </section>

          {/* Call to Action */}
          <div style={styles.ctaSection}>
            <h2 style={styles.ctaTitle}>Join Our Mission</h2>
            <p style={styles.ctaSubtitle}>
              Be part of the community that's transforming how developers collaborate and grow together
            </p>
            <div style={styles.ctaButtons}>
              <button 
                style={styles.primaryCta}
                className="primary-cta"
                onClick={() => navigate('/login?mode=signup')}
              >
                Get Started
              </button>
              <button 
                style={styles.secondaryCta}
                className="secondary-cta"
                onClick={() => navigate('/developerspage')}
              >
                Meet the Team
              </button>
            </div>
          </div>
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

export default About;