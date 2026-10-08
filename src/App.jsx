import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Github, Linkedin, ArrowRight, MessageSquare,
  X, ExternalLink, MapPin, Award, Menu, Instagram, ArrowUpRight
} from 'lucide-react';

import Silk from '../animations/silk';
import BorderGlow from '../animations/borderglow';
import CurvedLoop from '../animations/curvedloop';
import FlowingMenu from '../animations/flowingmenu';
import LogoLoop from '../animations/logoloop';
import Plasma from '../animations/plasma';
import LightRays from '../animations/light rays';
import Folder from '../animations/Folder';
import Galaxy from '../animations/Galaxy';
import DomeGallery from '../animations/dome gallery';
import Threads from '../animations/threads';
import Particles from '../animations/particles';

/* ─── Data ──────────────────────────────────────────────────────────────────── */

const NAV = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#projects' },
  { label: 'Certificates', href: '#certificates' },
  { label: 'Contact', href: '#contact' },
];

const PROJECTS = [
  {
    id: 1, title: 'JobConnect', category: 'Enterprise Solution',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
    tags: ['HTML', 'CSS', 'JavaScript', 'Flask', 'MySQL / SQLite'],
    overview: 'JobConnect is a web-based platform designed to connect small local vendors (department stores, fruit shops, gas stations, salons, etc.) with nearby job seekers. The goal is to simplify hiring for small businesses while providing quick employment opportunities for local workers through an easy-to-use digital solution.',
    features: [
      'Vendor job posting with role, salary, and location',
      'Category and location-based filtering',
      'Simple and intuitive job application flow',
      'Admin dashboard for listing management',
      'Secure form handling and backend validation',
    ],
    innovations: [
      '"Focused specifically on unorganized and small-scale businesses"',
      '"Minimal learning curve for non-technical users"',
      '"Local-first hiring approach to reduce community unemployment"',
    ],
    github: 'https://github.com/aneesh194/JobConnect-fullstack-application',
  },
  {
    id: 2, title: 'Health Chatbot', category: 'AI-Powered healthcare Bot',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800',
    tags: ["ML", "NLP", "HealthTech"],
    overview: 'Health Chatbot is a Python-based medical assistant that provides preliminary health guidance by analyzing user-entered symptoms. It uses machine learning to predict possible diseases and recommend appropriate medical departments.',
    features: [
      "Interactive chatbot for symptom input",
      "ML-based disease prediction (Decision Tree)",
      "Doctor and department recommendation system",
      "User-friendly GUI built with Tkinter",
      "Fast and lightweight offline execution",
    ],
    innovations: [
      "Bridges the gap between patients and healthcare access",
      "Instant guidance before hospital visitation",
      "Explainable predictions for medical guidance"
    ],
    github: 'https://github.com/aneesh194/Healthcare-Chatbot',
  },
  {
    id: 3,
    title: 'Error Explainer',
    category: 'AI-Powered Error Analysis',
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800',
    tags: ['AI', 'Machine Learning', 'React', 'NLP'],

    overview: 'An intelligent AI-powered tool that analyzes programming errors and provides clear, human-friendly explanations along with possible fixes, helping developers debug faster and learn effectively.',

    features: [
      'Instant error detection and explanation',
      'Beginner-friendly breakdown of complex errors',
      'Suggested fixes and code improvements',
      'Supports multiple programming languages',
    ],

    innovations: [
      '"Transforms complex compiler errors into simple language"',
      '"Acts like a real-time debugging assistant for developers"',
    ],

    github: 'https://github.com/aneesh194/Error-Explainer',
  },
  {
    id: 4,
    title: 'HyperDrive 3D',
    category: '3D Racing Game',
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800',
    tags: ['Three.js', 'WebGL', 'React', 'Game Development'],

    overview: 'A high-speed browser-based 3D racing game built using WebGL and Three.js, delivering smooth gameplay, immersive environments, and arcade-style racing mechanics directly in the browser.',

    features: [
      'Real-time 3D racing environment in the browser',
      'Smooth player controls with responsive steering',
      'Obstacle and collision detection system',
      'Dynamic camera system for immersive racing view',
    ],

    innovations: [
      '"Optimized rendering for smooth gameplay in WebGL"',
      '"Arcade-style physics tuned for fast-paced racing experience"',
    ],

    github: 'https://github.com/aneesh194/HyperDrive-3D-Racing-Game',
  },
  {
    id: 5,
    title: 'TURFO',
    category: 'Sports Turf Booking Platform',
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800',
    tags: ['React', 'Node.js', 'MongoDB', 'Full Stack'],

    overview: 'A full-stack turf booking platform that allows users to discover, book, and manage sports turfs seamlessly, while providing turf owners with real-time booking management and analytics.',

    features: [
      'Real-time turf slot booking system',
      'Browse and discover nearby sports turfs',
      'User-friendly booking and scheduling interface',
      'Booking history and management dashboard',
    ],

    innovations: [
      '"End-to-end platform for both players and turf owners"',
      '"Real-time availability and instant booking experience"',
    ],

    github: 'https://github.com/aneesh194/TURFO-Turf-booking-app',
  },
  {
    id: 6,
    title: 'PharmaGo',
    category: 'Healthcare & Medicine Delivery Platform',
    image: 'https://images.unsplash.com/photo-1588776814546-ec7e4c7c5b65?auto=format&fit=crop&q=80&w=800',
    tags: ['React', 'Node.js', 'MongoDB', 'Full Stack'],

    overview: 'A full-stack medicine ordering platform that enables users to browse, order, and receive medicines at their doorstep, with a seamless digital healthcare experience.',

    features: [
      'Online medicine browsing and ordering system',
      'Prescription upload for verified medicine purchase',
      'Cart, checkout, and order management',
      'User authentication and profile system',
    ],

    innovations: [
      '"Bridges patients and pharmacies through a digital platform"',
      '"Simplifies healthcare access with on-demand medicine delivery"',
    ],

    github: 'https://github.com/aneesh194/PharmaGo-Medicine-ordering-app',
  },
];

const TECH_STACK = [
  { src: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg', alt: 'React' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg', alt: 'HTML5' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg', alt: 'Tailwind CSS' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg', alt: 'Python' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png', alt: 'JavaScript' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg', alt: 'Node.js' },
];

const SOFTWARE_SKILLS = [
  { icon: '◈', name: 'Machine Learning', level: 'Advanced' },
  { icon: '▷', name: 'Python, JavaScript, Java, HTML', level: 'Expert' },
  { icon: '</', name: 'Full-Stack Web / Application', level: 'Advanced' },
  { icon: '▦', name: 'Database Architecture', level: 'Intermediate' },
];

const CREATIVE_SKILLS = [
  { icon: '▶', name: 'Video Editing / VFX', level: 'Expert' },
  { icon: '⬜', name: 'Videography', level: 'Professional' },
  { icon: '▣', name: 'UI / UX Design', level: 'Advanced' },
  { icon: '◆', name: 'Digital Strategy', level: 'Advanced' },
];

/* ─── Header ─────────────────────────────────────────────────────────────────  */

function Header() {
  const [active, setActive] = useState('#hero');
  const [mobileOpen, setMobile] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      for (const { href } of [...NAV].reverse()) {
        const el = document.querySelector(href);
        if (el && window.scrollY >= el.offsetTop - 120) { setActive(href); return; }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkCls = (href) =>
    `px-4 py-2 rounded-full text-xs font-sans uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${active === href ? 'bg-white text-black font-bold shadow-md' : 'text-white/70 hover:text-white'
    }`;

  return (
    <>
      <header className="fixed top-6 right-6 sm:top-10 sm:right-12 z-[100] hidden sm:block">
        {/* Desktop pill */}
        <nav className="flex items-center gap-1 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full px-2 py-2 shadow-2xl">
          {NAV.map(({ label, href }) => (
            <a key={href} href={href} onClick={() => { setActive(href); setMobile(false); }} className={linkCls(href)}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      {/* Mobile Controls - Floating layer */}
      <div className="fixed top-4 right-4 z-[200] sm:hidden flex flex-col items-center gap-3">
        {/* Menu Toggle */}
        <button
          onClick={() => setMobile(!mobileOpen)}
          className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-2xl"
        >
          <motion.div animate={{ rotate: mobileOpen ? 90 : 0 }} transition={{ duration: 0.25 }}>
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </motion.div>
        </button>

        {/* Social Icons (Hero only) */}
        <AnimatePresence>
          {!mobileOpen && active === '#hero' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-2"
            >
              <a href="https://github.com/aneesh194" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-zinc-400">
                <Github size={14} />
              </a>
              <a href="http://linkedin.com/in/aneesh-kumar194" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-zinc-400">
                <Linkedin size={14} />
              </a>
              <a href="https://www.instagram.com/_.aneeshh__" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-zinc-400">
                <Instagram size={14} />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full-screen mobile overlay — circular reveal from button */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 32px) 32px)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at calc(100% - 32px) 32px)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 32px) 32px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[150] sm:hidden"
            style={{ background: 'rgba(5,5,5,0.98)', backdropFilter: 'blur(30px)' }}
          >
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/[0.04] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/[0.03] rounded-full blur-[100px] pointer-events-none" />

            {/* Nav items — staggered blur-up */}
            <div className="flex flex-col items-center justify-center h-full gap-5">
              {NAV.map(({ label, href }, i) => (
                <motion.a
                  key={href}
                  href={href}
                  initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
                  onClick={() => { setActive(href); setMobile(false); }}
                  className={`text-[2.6rem] font-sans font-black uppercase tracking-tighter leading-none transition-colors ${active === href ? 'text-red-600' : 'text-white/90 hover:text-white'
                    }`}
                >
                  {label}
                </motion.a>
              ))}
            </div>

            {/* Corner accent line */}
            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Project Modal ──────────────────────────────────────────────────────────── */

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-[#111] border border-white/10 rounded-3xl p-6 sm:p-10 max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>

          <p className="font-sans text-xs uppercase tracking-[0.4em] text-zinc-500 mb-3">{project.category}</p>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <h2 className="font-sans font-bold text-3xl sm:text-5xl text-white leading-tight">{project.title}</h2>
            <a href={project.github}
              target="_blank"
              rel="noreferrer"
              className="self-start flex-shrink-0 inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300">
              Visit on Github <ExternalLink size={12} />
            </a>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.map(t => (
              <span key={t} className="px-3 py-1 bg-white/10 rounded-full text-xs text-zinc-300 font-sans">{t}</span>
            ))}
          </div>

          <div className="grid md:grid-cols-[1fr_260px] gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-600 text-sm">◎</span>
                <h3 className="font-sans font-bold text-xs uppercase tracking-[0.4em] text-white">Project Overview</h3>
              </div>
              <p className="text-zinc-400 font-sans text-sm leading-relaxed mb-8">{project.overview}</p>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-600 text-sm">◎</span>
                <h3 className="font-sans font-bold text-xs uppercase tracking-[0.4em] text-white">Key Features</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {project.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/5 rounded-xl p-4">
                    <span className="text-red-600 mt-0.5 text-xs">●</span>
                    <span className="text-zinc-300 font-sans text-xs leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-red-600">✦</span>
                <h3 className="font-sans font-bold text-xs uppercase tracking-[0.4em] text-white">Innovations</h3>
              </div>
              <div className="space-y-4">
                {project.innovations.map((item, i) => (
                  <p key={i} className="text-zinc-400 font-sans text-xs leading-relaxed italic">{item}</p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Skill Row ──────────────────────────────────────────────────────────────── */

function SkillRow({ skill, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between py-3 sm:py-4 border-b border-white/5 group hover:border-white/20 transition-colors cursor-default"
    >
      <div className="flex items-center gap-3">
        <span className="text-zinc-600 font-mono text-xs w-4 flex-shrink-0">{skill.icon}</span>
        <span className="font-sans text-xs sm:text-sm text-zinc-300 group-hover:text-white transition-colors">{skill.name}</span>
      </div>
      <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-zinc-600 group-hover:text-red-600 transition-colors flex-shrink-0 ml-2">{skill.level}</span>
    </motion.div>
  );
}

/* ─── Preloader ─────────────────────────────────────────────────────────────── */

function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        // Slower, more organic progress
        const increment = Math.random() * 6 + 1;
        return Math.min(prev + increment, 100);
      });
    }, 150);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      className="fixed inset-0 z-[1000] bg-[#050505] flex flex-col items-center justify-center select-none overflow-hidden"
    >
      <div className="relative w-[300px] sm:w-[500px]">
        {/* Background Large Number */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          className="absolute -top-32 -left-12 text-[15rem] sm:text-[22rem] font-sans font-black leading-none text-white pointer-events-none"
        >
          {Math.floor(progress)}
        </motion.span>

        {/* Progress Bar Container */}
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4 font-sans px-1">
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[10px] text-zinc-500 uppercase tracking-[0.5em] mb-1">// Initialization</span>
              <span className="text-[10px] sm:text-xs text-white font-bold tracking-[0.2em] uppercase">Visual Artifacts</span>
            </div>
            <span className="text-3xl sm:text-5xl font-elegant italic text-white leading-none">
              {Math.floor(progress)}<span className="text-xs not-italic ml-1 opacity-40">%</span>
            </span>
          </div>

          <div className="h-[1px] w-full bg-white/5 relative overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              className="absolute inset-0 bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.8)] origin-left"
            />
          </div>

          <div className="mt-6 flex justify-between px-1">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-zinc-600 font-sans text-[8px] uppercase tracking-[0.4em]"
            >
              Curating Excellence
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-zinc-600 font-sans text-[8px] uppercase tracking-[0.4em]"
            >
              System.Ready()
            </motion.span>
          </div>
        </div>
      </div>

      {/* Aesthetic Accents */}
      <div className="absolute top-12 left-12 grid grid-cols-2 gap-2 opacity-20">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-1 h-1 bg-white rounded-full" />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── App ────────────────────────────────────────────────────────────────────── */

const App = () => {
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const { scrollY } = useScroll();

  // Multilayered Parallax Transforms
  const heroImageY = useTransform(scrollY, [0, 1000], [0, 250]);
  const heroTextY = useTransform(scrollY, [0, 1000], [0, -150]);
  const heroBgY = useTransform(scrollY, [0, 1000], [0, 350]);

  const aboutBgY = useTransform(scrollY, [0, 2000], [200, -200]);
  const aboutTextY = useTransform(scrollY, [0, 2000], [100, -100]);
  const aboutImageY = useTransform(scrollY, [0, 2000], [-100, 100]);

  const expertiseY = useTransform(scrollY, [500, 2500], [100, -100]);
  const projectsY = useTransform(scrollY, [1500, 4000], [150, -150]);

  // Spring Physics for Buttery Smooth Motion
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothHeroImageY = useSpring(heroImageY, springConfig);
  const smoothHeroTextY = useSpring(heroTextY, springConfig);
  const smoothHeroBgY = useSpring(heroBgY, springConfig);
  const smoothAboutBgY = useSpring(aboutBgY, springConfig);
  const smoothAboutTextY = useSpring(aboutTextY, springConfig);
  const smoothAboutImageY = useSpring(aboutImageY, springConfig);
  const smoothExpertiseY = useSpring(expertiseY, springConfig);
  const smoothProjectsY = useSpring(projectsY, springConfig);



  const expertiseItems = [
    { link: '#', text: 'Visual Design', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800' },
    { link: '#', text: 'Responsive Web', image: 'https://images.unsplash.com/photo-1678690832871-8b9993c76aa8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { link: '#', text: 'Interactive UX', image: 'https://images.unsplash.com/photo-1602576666092-bf6447a729fc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dWklMjBkZXNpZ258ZW58MHx8MHx8fDA%3D' },
    { link: '#', text: 'Scalable Architecture', image: 'https://plus.unsplash.com/premium_photo-1723849222657-e1e48a0a306e?q=80&w=1121&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  ];

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <Preloader key="loader" onComplete={() => setLoading(false)} />
      ) : (
        <motion.main
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative min-h-screen bg-background overflow-x-hidden text-white"
        >
          <Header />

          {/* ══════════════════ HERO ══════════════════ */}
          <section id="hero" className="relative h-screen flex items-center justify-center bg-black overflow-hidden select-none">
            {/* Background Marquee Layer */}
            <motion.div style={{ y: smoothHeroBgY }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: "-50%" }}
                transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                className="whitespace-nowrap flex items-center"
              >
                <span className="text-[25vw] font-sans font-black uppercase tracking-tighter text-white/[0.08] leading-none px-4">
                  Aneesh Kumar S — Aneesh Kumar S —
                </span>
                <span className="text-[25vw] font-sans font-black uppercase tracking-tighter text-white/[0.08] leading-none px-4">
                  Aneesh Kumar S — Aneesh Kumar S —
                </span>
              </motion.div>
            </motion.div>

            {/* Sidebar Socials (Left) */}
            <div className="absolute left-8 bottom-32 hidden lg:flex flex-col gap-10 z-[60]">
              <motion.a
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                href="https://github.com/aneesh194" target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-red-600 transition-colors duration-300 transform -rotate-90 origin-left whitespace-nowrap text-[10px] uppercase font-bold tracking-[0.3em]">
                Github —
              </motion.a>
              <motion.a
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}
                href="http://linkedin.com/in/aneesh-kumar194" target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-red-600 transition-colors duration-300 transform -rotate-90 origin-left whitespace-nowrap text-[10px] uppercase font-bold tracking-[0.3em]">
                LinkedIn —
              </motion.a>
              <motion.a
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }}
                href="https://www.instagram.com/_.aneeshh__" target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-red-600 transition-colors duration-300 transform -rotate-90 origin-left whitespace-nowrap text-[10px] uppercase font-bold tracking-[0.3em]">
                Instagram —
              </motion.a>
            </div>

            {/* Central Portrait Container */}
            <div className="relative z-10 w-full h-full flex items-end justify-center pointer-events-none pt-20">
              <motion.div
                style={{ y: smoothHeroImageY }}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.8, ease: [0.19, 1, 0.22, 1] }}
                className="h-[90vh] w-auto relative flex items-end justify-center will-change-transform"
              >
                <img
                  src="/profile.png"
                  alt="Aneesh Kumar S"
                  className="h-full w-auto object-contain object-bottom filter grayscale contrast-125 brightness-105"
                  style={{ mixBlendMode: 'lighten' }}
                />
              </motion.div>
            </div>

            {/* Content Overlays */}
            <motion.div style={{ y: smoothHeroTextY }} className="absolute inset-0 z-[70] flex flex-col justify-between p-6 sm:p-12 md:p-16 pointer-events-none will-change-transform">
              {/* Top-Left Intro Label */}
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <motion.span
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
                  className="font-sans text-[10px] sm:text-xs font-bold uppercase tracking-[0.5em] text-red-600">
              // Creative Developer
                </motion.span>

                <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />
              </div>

              {/* Bottom-Right Tagline & CTA */}
              <div className="flex flex-col items-end justify-end w-full md:flex-row md:items-end md:justify-between">
                <div className="hidden lg:block">
                  {/* Spacer for sidebar */}
                </div>

                <div className="text-right max-w-[85vw] sm:max-w-md pointer-events-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                  >
                    <h2 className="font-sans font-bold text-2xl sm:text-5xl lg:text-6xl uppercase leading-[1.1] tracking-tighter mb-5 sm:mb-8 text-red-600">
                      <span className="font-elegant italic font-medium lowercase text-white text-[1em] sm:text-[1.2em] tracking-normal px-1 sm:px-2 block sm:inline mb-2 sm:mb-0">Visual Intelligence</span> <br className="hidden sm:block" />
                      Engineer.
                    </h2>
                    <div className="flex items-center justify-end gap-4 sm:gap-10">
                      <p className="text-zinc-500 font-sans text-[8px] sm:text-[10px] uppercase tracking-[0.4em] hidden sm:block leading-relaxed">
                        Engineering digital <br /> perfection at every pixel.
                      </p>
                      <a href="#projects" className="group relative flex-shrink-0 flex items-center justify-center w-12 h-12 sm:w-24 sm:h-24 rounded-full bg-white text-black hover:bg-red-600 transition-all duration-700 hover:scale-110 overflow-hidden shadow-2xl">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 90 }}
                          className="flex items-center justify-center w-full h-full"
                        >
                          <ArrowRight size={20} className="group-hover:text-white transition-colors sm:hidden" />
                          <ArrowRight size={24} className="group-hover:text-white transition-colors hidden sm:block" />
                        </motion.div>
                      </a>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Scroll Indicator — visible on all screens */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 sm:bottom-10 sm:left-10 sm:translate-x-0 flex flex-col items-center sm:items-start gap-3 pointer-events-none z-[60]">
              <span className="text-[9px] sm:text-[10px] text-zinc-600 uppercase font-bold tracking-[0.5em] sm:tracking-[0.6em]">Scroll to explore</span>
              <div className="w-12 sm:w-16 h-[2px] bg-zinc-800 relative overflow-hidden">
                <motion.div
                  animate={{ x: [-48, 48] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-y-0 w-6 sm:w-8 bg-red-600"
                />
              </div>
            </div>
          </section>

          {/* ══════════════════ ABOUT ══════════════════ */}
          <section id="about" className="relative py-24 sm:py-40 lg:py-48 px-6 sm:px-10 lg:px-12 overflow-hidden bg-black">
            <motion.div style={{ y: smoothAboutBgY }} className="absolute inset-0 z-0 opacity-20 pointer-events-none will-change-transform">
              <Threads color={[1.0, 1.0, 1.0]} amplitude={2} distance={0.3} enableMouseInteraction={true} />
            </motion.div>
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <motion.div style={{ y: smoothAboutTextY }} className="will-change-transform">
                <h2 className="font-elegant italic text-5xl sm:text-7xl md:text-8xl mb-8 sm:mb-12 relative text-red-600">
                  Essence.
                  <span className="absolute -top-8 -left-4 text-[8rem] sm:text-[12rem] text-white/[0.03] font-sans font-bold -z-10 select-none">01</span>
                </h2>
                <div className="max-w-2xl">
                  <p className="font-serif text-2xl sm:text-4xl lg:text-5xl text-white leading-tight flex flex-wrap gap-x-[0.3em] gap-y-[0.1em]">
                    {"I’m an AI/ML student and developer who builds modern web experiences and works on a wide range of tech projects. From websites and AI-based applications to creative and experimental builds, I focus on solving real problems with clean design, smart logic, and innovative ideas.".split(" ").map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0.15 }}
                        whileInView={{ opacity: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: i * 0.02,
                          ease: "easeOut"
                        }}
                        viewport={{ once: false, margin: "-20%" }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </p>
                </div>
              </motion.div>
              <motion.div style={{ y: smoothAboutImageY }} className="relative aspect-[4/5] sm:aspect-square group max-w-md mx-auto">
                <div className="absolute inset-0 bg-white/5 blur-[100px] rounded-full -z-10 group-hover:bg-white/10 transition-all duration-700" />
                <BorderGlow borderRadius={24} glowColor="0 0 100" glowIntensity={1.2} backgroundColor="#000">
                  <div className="w-full h-full overflow-hidden rounded-[22px] bg-black">
                    <img
                      src="/about.jpeg"
                      alt="About Aneesh"
                      className="w-full h-full object-cover object-[center_20%] filter grayscale group-hover:grayscale-0 transition-all duration-1000 scale-[1.01] group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                      <p className="font-elegant italic text-2xl text-white">Aneesh Kumar S</p>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-red-600 mt-2">The Developer</p>
                    </div>
                  </div>
                </BorderGlow>
              </motion.div>
            </div>
          </section>

          <section className="relative h-[70vh] sm:h-[90vh] w-full bg-black overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
            <DomeGallery
              fit={0.8}
              segments={30}
              minRadius={typeof window !== 'undefined' && window.innerWidth < 768 ? 450 : 600}
              grayscale={true}
              autoRotationSpeed={0.1}
              overlayBlurColor="#000000"
              openedImageWidth="min(900px, 95vw)"
              openedImageHeight="min(600px, 85vh)"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
          </section>

          {/* ══════════════════ EXPERTISE ══════════════════ */}
          <section id="expertise" className="relative pt-32 pb-16 sm:pt-48 sm:pb-24 lg:pt-56 px-6 sm:px-10 lg:px-12 overflow-hidden bg-black">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 z-0 opacity-40">
              <Particles
                particleCount={120}
                particleSpread={12}
                speed={0.05}
                particleBaseSize={150}
                moveParticlesOnHover={true}
                alphaParticles={true}
              />
            </div>
            <motion.div style={{ y: smoothExpertiseY }} className="max-w-7xl mx-auto relative z-10 will-change-transform">
              <p className="font-sans text-xs uppercase tracking-[0.4em] text-zinc-500 mb-2">// Profile</p>
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="font-sans font-bold text-4xl sm:text-5xl md:text-6xl mb-12 sm:mb-16 text-red-600"
              >
                Expertise &amp; Background
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_300px] gap-8 lg:gap-12">

                {/* Software Engineering */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-4">Software Engineering</p>
                  {SOFTWARE_SKILLS.map((s, i) => <SkillRow key={i} skill={s} delay={i * 0.07} />)}
                </motion.div>

                {/* Creative Direction */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-4">Creative Direction</p>
                  {CREATIVE_SKILLS.map((s, i) => <SkillRow key={i} skill={s} delay={i * 0.07} />)}
                </motion.div>

                {/* Academic Foundation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-zinc-900/60 border border-white/8 rounded-2xl p-5 sm:p-6"
                >
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                    <Award size={15} className="text-zinc-400" />
                  </div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-4">Academic Foundation</p>

                  <div className="mb-5">
                    <p className="font-sans font-semibold text-sm text-white mb-1">B.Sc. AI ML (2024 — 2027)</p>
                    <p className="font-sans text-xs text-zinc-500 mb-2">Sri Krishna Arts &amp; Science College</p>
                    <span className="inline-block px-3 py-1 bg-zinc-800 rounded-full text-[10px] text-zinc-400 font-sans">CGPA 7.8</span>
                  </div>

                  <div className="border-t border-white/5 pt-4 mb-5">
                    <p className="font-sans font-semibold text-sm text-white mb-1">Higher Secondary (2022 — 2024)</p>
                    <p className="font-sans text-xs text-zinc-500 mb-2">PKD Matriculation School</p>
                    <span className="inline-block px-3 py-1 bg-zinc-800 rounded-full text-[10px] text-zinc-400 font-sans">Score 74.4%</span>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-2">Current Base</p>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <MapPin size={12} className="text-zinc-500" />
                      <span className="font-sans text-xs">Coimbatore, Tamil Nadu</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* ══════════════════ FLOWING MARQUEE ══════════════════ */}
          <section className="h-[28vh] sm:h-[40vh] border-y border-white/5 bg-black">
            <FlowingMenu items={expertiseItems} speed={15} textColor="#fff" marqueeBgColor="#FFFFFF" />
          </section>

          {/* ══════════════════ PROJECTS ══════════════════ */}
          <section id="projects" className="relative pt-24 pb-12 sm:pt-40 sm:pb-16 lg:pt-48 lg:pb-20 px-6 sm:px-10 lg:px-12 overflow-hidden bg-black">
            {/* Desktop: CurvedLoop background */}
            <div className="hidden sm:block absolute inset-x-0 top-1/2 -translate-y-1/2 -z-10 opacity-30 pointer-events-none scale-[1.5] overflow-visible">
              <div className="flex items-center justify-center">
                <CurvedLoop
                  marqueeText="PROJECTS • SELECTED WORKS • CASE STUDIES • DESIGN • "
                  speed={0.6}
                  curveAmount={400}
                  className="uppercase font-sans font-black tracking-[-0.02em] fill-none stroke-white/40 stroke-[1.5px] text-[8rem]"
                />
              </div>
            </div>

            {/* Mobile: dark flowing Threads background */}
            <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none sm:hidden">
              <Threads
                color={[1.0, 1.0, 1.0]}
                amplitude={4}
                distance={0.5}
                enableMouseInteraction={false}
              />
            </div>

            <motion.div style={{ y: smoothProjectsY }} className="relative z-10 max-w-7xl mx-auto will-change-transform">
              <div className="mb-24 sm:mb-40 text-center pt-10 sm:pt-0">
                <h2 className="font-elegant italic text-4xl sm:text-6xl md:text-8xl mb-3">Selected Works</h2>
                <p className="text-zinc-500 tracking-[0.4em] uppercase text-xs">Curating excellence through digital craftsmanship</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center grid-auto-rows-fr">
                {PROJECTS.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    whileHover="hover"
                    initial="initial"
                    className={`group cursor-pointer relative w-full h-full ${idx >= 3 ? 'hidden sm:block' : ''}`}
                    onClick={() => setActiveProject(project)}
                  >
                    <BorderGlow borderRadius={20} glowColor="0 0 100" backgroundColor="transparent" glowIntensity={1.2} glowRadius={60}>
                      <div className="overflow-hidden rounded-[18px] relative aspect-[4/3] w-full h-full">
                        <motion.div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white relative z-10 overflow-hidden">
                          {/* Desktop: Simplified background circle for better performance */}
                          <div className="absolute inset-0 z-0 pointer-events-none hidden sm:flex items-center justify-center overflow-hidden">
                            <motion.div
                              variants={{
                                initial: { scale: 0, opacity: 0 },
                                hover: {
                                  scale: 750,
                                  opacity: 1,
                                  transition: {
                                    scale: { duration: 8, ease: "linear" },
                                    opacity: { duration: 0.5 }
                                  }
                                }
                              }}
                              transition={{
                                duration: 1.2,
                                ease: "easeInOut"
                              }}
                              className="w-4 h-4 bg-black rounded-full"
                            />
                          </div>

                          {/* Mobile: Black Threads inside the white container */}
                          <div className="absolute inset-0 z-0 pointer-events-none flex sm:hidden opacity-30">
                            <Threads color={[0, 0, 0]} amplitude={2} distance={0.3} enableMouseInteraction={false} />
                          </div>

                          <motion.h3
                            variants={{
                              initial: { scale: 1 },
                              hover: { scale: 1.05 }
                            }}
                            transition={{ duration: 0.6 }}
                            className="relative z-20 font-elegant italic text-2xl sm:text-3xl lg:text-4xl text-center px-4 leading-tight text-black sm:group-hover:text-white transition-colors duration-500"
                          >
                            {project.title}
                          </motion.h3>

                          <motion.div
                            variants={{
                              initial: { opacity: 0, x: 0, y: 0 },
                              hover: { opacity: 1, x: 4, y: -4 }
                            }}
                            transition={{ duration: 0.6 }}
                            className="absolute top-6 right-6 z-20 text-black sm:group-hover:text-white transition-colors duration-500"
                          >
                            <ArrowUpRight size={24} />
                          </motion.div>

                          <motion.div
                            variants={{
                              initial: { opacity: 0.4 },
                              hover: { opacity: 0.6 }
                            }}
                            transition={{ duration: 0.6 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full text-center px-4 text-black sm:group-hover:text-white transition-colors duration-500"
                          >
                            <p className="font-sans text-[10px] uppercase tracking-[0.4em]">
                              {project.category}
                            </p>
                          </motion.div>
                        </motion.div>
                      </div>
                    </BorderGlow>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 sm:mt-16 flex justify-center flex-col items-center">
                <a
                  href="https://github.com/aneesh194"
                  target="_blank"
                  rel="noreferrer"
                  className="group relative inline-flex items-center gap-4 bg-white text-black px-10 py-4 rounded-full font-sans font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-red-600 hover:text-white transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-accent/40"
                >
                  <Github size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
                  View All Projects
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform opacity-30 group-hover:opacity-100" />
                </a>
              </div>
            </motion.div>
          </section>

          {/* ══════════════════ TECH STACK ══════════════════ */}
          <section className="pb-16 pt-8 sm:pb-24 sm:pt-12 bg-black">
            <h2 className="text-center font-serif text-xs sm:text-sm tracking-[0.6em] text-zinc-500 uppercase mb-12 sm:mb-16">Preferred Tech Stack</h2>
            <LogoLoop logos={TECH_STACK} speed={90} logoHeight={40} gap={80} fadeOut={true} fadeOutColor="#000000" />
          </section>

          {/* ══════════════════ CERTIFICATIONS ══════════════════ */}
          <section id="certificates" className="relative pt-24 pb-16 sm:pt-52 sm:pb-32 px-6 sm:px-10 lg:px-12 overflow-hidden bg-black">
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
              <Galaxy
                starSpeed={0.3}
                density={1.5}
                speed={0.5}
                glowIntensity={0.5}
                twinkleIntensity={0.4}
                hueShift={360}
              />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-20">
              {/* Folder Component — Top on Mobile, Left side on Desktop */}
              <div className="flex justify-center items-center w-full overflow-visible pt-20 pb-8 sm:py-20 order-1">
                <div className="scale-[0.85] sm:scale-[1.2] md:scale-[1.3] lg:scale-[1.6]">
                  <Folder
                    color="#65615D"
                    size={2}
                    items={[
                      <img src="/certi3.png" className="w-full h-full object-cover rounded-[10px]" />,
                      <img src="/certi1.png" className="w-full h-full object-cover rounded-[10px]" />,
                      <img src="/certi2.jpeg" className="w-full h-full object-cover rounded-[10px]" />
                    ]}
                  />
                </div>
              </div>

              {/* Text Content — Below on Mobile, Right side on Desktop */}
              <div className="text-center flex flex-col items-center px-6 order-2 mt-8 sm:mt-0">
                <div className="hidden sm:flex w-14 h-14 sm:w-16 sm:h-16 bg-zinc-900 border border-white/10 rounded-2xl items-center justify-center mb-8">
                  <Award size={24} className="text-zinc-400" />
                </div>
                <h2 className="font-sans font-bold text-4xl sm:text-6xl md:text-7xl mb-3 leading-tight">
                  Professional <br />
                  <span className="italic font-elegant font-medium text-zinc-400">Certifications.</span>
                </h2>
                <p className="mt-6 text-zinc-500 font-sans text-sm leading-relaxed max-w-md">
                  I have consistently upgraded my skills through industry-recognized programs. Explore the vault to view my verified expertise in AI, ML, and Multimedia engineering.
                </p>
                <div className="mt-10">
                  <a href="https://drive.google.com/drive/folders/14nz7A0rDn0eiPNzlV-1XwJYxHSjJrzUf?usp=drive_link"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 bg-white text-black px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-sans font-bold uppercase tracking-widest text-xs sm:text-sm hover:bg-red-600 hover:text-white transition-all duration-300">
                    Open Certificate Vault <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════ CONTACT ══════════════════ */}
          <section id="contact" className="relative py-24 sm:py-40 lg:py-48 px-6 sm:px-10 lg:px-12 overflow-hidden bg-black">
            <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
              <LightRays
                raysColor="#FFFFFF"
                raysSpeed={0.6}
                raysOrigin="top-center"
                pulsating={true}
                rayLength={2.5}
                lightSpread={2}
              />
            </div>
            <div className="relative z-10 w-full text-center">
              <motion.h2
                initial={{ opacity: 0, y: 40, filter: "blur(20px)", scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="text-white font-sans font-extrabold text-5xl sm:text-7xl md:text-[8vw] mb-14 leading-[0.9] tracking-tighter px-4"
              >
                Let's build <br />
                <span className="block sm:inline">something </span><span className="font-elegant italic text-zinc-500 font-normal tracking-normal">impactful.</span>
              </motion.h2>
              <div className="flex flex-col items-center gap-12 mt-16">
                <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10">
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=aneeshkumars194@gmail.com&su=Portfolio%20Inquiry"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white text-black px-8 py-3.5 sm:py-4 rounded-full flex items-center gap-3 font-sans font-bold text-[9px] sm:text-xs tracking-[0.1em] lowercase hover:bg-red-600 hover:text-white transition-all shadow-2xl"
                  >
                    aneeshkumars194@gmail.com <ArrowUpRight size={16} />
                  </a>
                  <div className="flex items-center gap-5 sm:gap-6 text-zinc-400">
                    <a href="https://www.instagram.com/_.aneeshh__" target="_blank" rel="noreferrer" className="hover:text-red-500 transition-colors"><Instagram size={20} /></a>
                    <a href="http://linkedin.com/in/aneesh-kumar194" target="_blank" rel="noreferrer" className="hover:text-red-500 transition-colors"><Linkedin size={20} /></a>
                    <a href="https://github.com/aneesh194" target="_blank" rel="noreferrer" className="hover:text-red-500 transition-colors"><Github size={20} /></a>
                  </div>
                </div>

                <div className="mt-20 sm:mt-24 text-zinc-600 font-sans text-[8px] sm:text-[10px] uppercase tracking-[0.8em] opacity-50 flex items-center gap-4 justify-center">
                  BASED IN COIMBATORE &bull; OPEN FOR COLLABORATIONS
                </div>

                <div className="w-[1px] h-12 bg-gradient-to-b from-zinc-800 to-transparent mx-auto mt-6" />
              </div>
            </div>
          </section>

          <footer className="py-12 px-6 sm:px-12 text-zinc-600 text-[8px] sm:text-[9px] uppercase tracking-[0.4em] flex flex-col items-center gap-3">
            <span>© 2026 Aneesh Kumar S. All rights reserved.</span>
          </footer>

          {/* ══════════════════ PROJECT MODAL ══════════════════ */}
          {activeProject && <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />}
        </motion.main>
      )}
    </AnimatePresence>
  );
};

export default App;
