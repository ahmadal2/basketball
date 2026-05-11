import React, { useState, useRef, useLayoutEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { Basketball } from './components/Basketball';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Menu, ArrowRight, User, Target, Award, Shield, Cpu } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CartDrawer } from './components/CartDrawer';

gsap.registerPlugin(ScrollTrigger);

const colors = [
  { name: 'Orange', value: '#FF5A00' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0066FF' },
  { name: 'Green', value: '#00FF66' },
  { name: 'Yellow', value: '#FFCC00' },
  { name: 'Pink', value: '#FF00FF' },
];

const App: React.FC = () => {
  const [themeColor, setThemeColor] = useState('#FF5A00');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<{ id: string; name: string; color: string; price: number }[]>([]);
  const [showPedestal, setShowPedestal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<any>(null);
  const spacingRef = useRef<HTMLHeadingElement>(null);

  const [showFloatingButton, setShowFloatingButton] = useState(false);

  const cycleColor = (direction: 'next' | 'prev') => {
    const currentIndex = colors.findIndex(c => c.value === themeColor);
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % colors.length;
    } else {
      nextIndex = (currentIndex - 1 + colors.length) % colors.length;
    }
    setThemeColor(colors[nextIndex].value);
  };

  const playCartSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Cool synthetic drop sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) { }
  };

  const addToCart = () => {
    playCartSound();
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Spalding Elite Ball',
      color: themeColor,
      price: 34.99
    };
    setCart([...cart, newItem]);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const scrollProgressRef = useRef(0);

  useLayoutEffect(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;

    // SPALDING text entrance
    if (spacingRef.current) {
      const headingChars = spacingRef.current.innerText.split('');
      spacingRef.current.innerHTML = headingChars.map(char => `<span class="inline-block">${char}</span>`).join('');
      gsap.fromTo(spacingRef.current.children,
        { opacity: 0, scale: 0.8, y: 50 },
        {
          opacity: 1, scale: 1, y: 0,
          duration: 1, stagger: 0.05, ease: "power3.out"
        }
      );
    }
    gsap.fromTo(".ui-fade-in",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.5 }
    );

    const onScroll = () => {
      const total = container.scrollHeight - container.clientHeight;
      const p = total > 0 ? container.scrollTop / total : 0;
      scrollProgressRef.current = p;
      setShowFloatingButton(p > 0.05);
      setShowPedestal(p > 0.55 && p < 0.78);

      // SPALDING text parallax
      if (spacingRef.current) {
        spacingRef.current.style.opacity = String(Math.max(0, 1 - p * 10));
        spacingRef.current.style.transform = `translateY(${-p * 400}px)`;
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative w-full h-screen p-6 overflow-hidden transition-colors duration-500" style={{ backgroundColor: themeColor }}>
      <style>{`
        ::selection {
          background-color: ${themeColor};
          color: white;
        }
      `}</style>
      {/* Main Container with 24px radius */}
      <div className="relative w-full h-full bg-brand-black rounded-[24px] overflow-hidden flex flex-col">

        {/* Navigation */}
        <nav className="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-8 md:py-12 ui-fade-in">
          <div className="text-xl md:text-2xl font-black tracking-tighter italic flex items-center gap-2 md:gap-3">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full flex items-center justify-center">
              <Menu className="w-3 h-3 md:w-4 md:h-4 text-black" />
            </div>
            <span className="uppercase font-display text-2xl md:text-3xl">BASKET BALL</span>
          </div>
          <div className="hidden lg:flex gap-16 text-[18px] font-medium uppercase tracking-widest">
            <a href="#" className="hover:opacity-80 transition-opacity" style={{ color: themeColor }}>Products</a>
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="text-white hover:opacity-80 transition-colors uppercase tracking-widest"
              style={{ color: isCustomizing ? themeColor : 'white' }}
            >
              Customize
            </button>
            <a href="#" className="text-white hover:opacity-80 transition-colors uppercase tracking-widest">Contacts</a>
          </div>
          {!isCartOpen && (
            <div className="flex items-center gap-4 md:gap-8 text-white ui-fade-in">
              <div
                className="cursor-pointer transition-all p-1.5 md:p-2 rounded-full border-2 hover:scale-110 flex items-center justify-center"
                style={{
                  backgroundColor: themeColor,
                  borderColor: themeColor,
                  color: 'white',
                  boxShadow: `0 0 20px ${themeColor}88`
                }}
              >
                <User className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div
                className="relative cursor-pointer group"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 group-hover:opacity-80 transition-colors" style={{ color: themeColor }} />
                <span className="absolute -top-2 -right-2 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>{cart.length}</span>
              </div>
            </div>
          )}
        </nav>

        {/* Color Customizer Overlay */}
        <AnimatePresence>
          {isCustomizing && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-32 left-1/2 -translate-x-1/2 z-[60] bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex gap-4"
            >
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setThemeColor(c.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${themeColor === c.value ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background Text Layer - Behind Ball */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <h1
            ref={spacingRef}
            className="text-[60px] sm:text-[100px] md:text-[180px] font-black leading-[1.0] tracking-[0.01em] text-brand-gray select-none uppercase font-display text-center"
          >
            SPALDING
          </h1>
        </div>

        {/* 3D Canvas Layer */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <Canvas shadows gl={{ antialias: true, alpha: true }}>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />
            <ambientLight intensity={0.4} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Basketball ref={ballRef} showPedestal={showPedestal} color={themeColor} scrollProgress={scrollProgressRef} />
            <ContactShadows position={[0, -3.5, 0]} opacity={0.3} scale={20} blur={2.5} far={4.5} />
            <Environment preset="studio" />
          </Canvas>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="relative flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth z-30 no-scrollbar"
        >
          {/* Section 1: Hero */}
          <section className="h-full w-full flex flex-col items-center justify-center snap-start relative px-6 md:px-12 overflow-hidden">

            {/* Top Left: Promotion Video */}
            <div className="absolute top-28 md:top-32 left-6 md:left-12 flex items-center gap-3 md:gap-4 group cursor-pointer z-40 ui-fade-in">
              <div
                className="w-10 h-10 md:w-14 md:h-14 rounded-full border flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                style={{
                  borderColor: `${themeColor}66`,
                  backgroundColor: `${themeColor}11`,
                  boxShadow: `0 0 20px ${themeColor}22`
                }}
              >
                <div
                  className="w-0 h-0 border-t-[6px] md:border-t-[8px] border-t-transparent border-l-[10px] md:border-l-[12px] border-b-[6px] md:border-b-[8px] border-b-transparent ml-1"
                  style={{ borderLeftColor: themeColor }}
                ></div>
              </div>
              <span className="text-[12px] md:text-[16px] font-normal uppercase tracking-widest text-brand-gray group-hover:text-white transition-colors">Promotion video</span>
            </div>

            {/* Bottom Left: Price & Language */}
            <div className="absolute bottom-10 md:bottom-12 left-6 md:left-12 z-40 ui-fade-in flex flex-col gap-8 md:gap-12">
              <div className="space-y-1 md:space-y-2">
                <div className="text-[28px] md:text-[36px] font-bold tracking-tighter leading-none" style={{ color: themeColor }}>$34.99</div>
                <div className="text-[10px] md:text-[14px] font-medium uppercase tracking-[0.1em] text-brand-gray">SIZE: 29.5 • OFFICIAL</div>
              </div>
              <div className="text-[10px] md:text-[12px] font-medium text-brand-gray uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                Ru
              </div>
            </div>


            {/* Bottom Right: Pagination */}
            <div className="absolute bottom-10 md:bottom-12 right-6 md:right-12 z-40 ui-fade-in flex flex-col items-center gap-6 md:gap-10">
              <div className="font-bold text-[10px] md:text-[14px] tracking-[0.1em] rotate-90 origin-center whitespace-nowrap mb-4" style={{ color: themeColor }}>
                01 / 06
              </div>
              <div className="flex flex-col gap-4 md:gap-6">
                <button
                  onClick={() => cycleColor('prev')}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                  style={{ borderColor: themeColor, color: themeColor, backgroundColor: `${themeColor}11` }}
                >
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 -rotate-90" />
                </button>
                <button
                  onClick={() => cycleColor('next')}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                  style={{ borderColor: themeColor, color: themeColor, backgroundColor: `${themeColor}11` }}
                >
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 rotate-90" />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center z-40">
              {/* Main content area is empty as the heading is in the background */}
            </div>

            {/* Centered Add to Cart Button at Bottom */}
            <div className="absolute bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 z-40 ui-fade-in">
              <button
                onClick={addToCart}
                className="text-white w-[140px] md:w-[180px] h-[48px] md:h-[56px] rounded-[10px] md:rounded-[12px] font-black text-[16px] md:text-[20px] uppercase tracking-[0.05em] hover:scale-110 active:scale-95 transition-all duration-500 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: themeColor,
                  boxShadow: `0 0 50px ${themeColor}88`
                }}
              >
                Add to Cart
              </button>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
              <div className="text-[8px] font-black uppercase tracking-[0.4em]">Scroll to Explore</div>
              <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
            </div>
          </section>

          {/* Section 2: Elite Control */}
          <section className="h-screen w-full flex items-start md:items-center justify-start snap-start pt-32 md:pt-0 px-6 md:px-40 relative">
            <div className="max-w-[75%] md:max-w-2xl text-left relative z-40">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-4 mb-6 md:mb-10 justify-start">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center border" style={{ backgroundColor: `${themeColor}11`, borderColor: `${themeColor}33` }}>
                    <Cpu className="w-5 h-5 md:w-7 md:h-7" style={{ color: themeColor }} />
                  </div>
                  <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em]" style={{ color: themeColor }}>Grip Technology</span>
                </div>
                <h2 className="text-5xl md:text-9xl font-black tracking-tighter mb-6 md:mb-10 uppercase leading-[0.8]">Elite<br />Control.</h2>
                <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-10 md:mb-16 max-w-lg">
                  Engineered with micro-textured composite leather for unparalleled grip and moisture management.
                </p>
                <div className="flex justify-start gap-8 md:gap-12">
                  <div className="space-y-2 md:space-y-3">
                    <div className="text-3xl md:text-5xl font-black tracking-tighter">100%</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black">Grip Rating</div>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <div className="text-3xl md:text-5xl font-black tracking-tighter">0.5mm</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black">Pebble Height</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Section 3: Perfect Flight */}
          <section className="h-screen w-full flex items-start md:items-center justify-end snap-start pt-32 md:pt-0 px-6 md:px-40 relative">
            <div className="max-w-[75%] md:max-w-2xl text-right relative z-40 ml-auto">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-4 mb-6 md:mb-10 justify-end">
                  <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em]" style={{ color: themeColor }}>Ballistics</span>
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center border" style={{ backgroundColor: `${themeColor}11`, borderColor: `${themeColor}33` }}>
                    <Target className="w-5 h-5 md:w-7 md:h-7" style={{ color: themeColor }} />
                  </div>
                </div>
                <h2 className="text-5xl md:text-9xl font-black tracking-tighter mb-6 md:mb-10 uppercase leading-[0.8]">Perfect<br />Flight.</h2>
                <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-10 md:mb-16 max-w-lg ml-auto">
                  Our symmetrical internal construction ensures a perfectly balanced rotation.
                </p>
                <div className="flex justify-end gap-8 md:gap-12">
                  <div className="space-y-2 md:space-y-3">
                    <div className="text-3xl md:text-5xl font-black tracking-tighter">0.85</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black">Drag Coeff</div>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <div className="text-3xl md:text-5xl font-black tracking-tighter">28.5</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black">Stability</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Section 4: Aerodynamics */}
          <section className="h-screen w-full flex flex-col items-center justify-between snap-start pt-32 md:py-32 pb-24 px-6 md:px-12 relative">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center relative z-40"
            >
              <h2 className="text-4xl md:text-8xl font-black tracking-tighter uppercase mb-4">Aerodynamics</h2>
              <p className="uppercase tracking-[0.3em] md:tracking-[0.6em] text-[9px] md:text-[11px] font-black" style={{ color: themeColor }}>Wind Tunnel Tested / Lab Certified</p>
            </motion.div>

            {/* HUD Elements */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[300px] h-[300px] md:w-[800px] md:h-[800px] border border-white/5 rounded-full flex items-center justify-center">
                <div className="w-[240px] h-[240px] md:w-[650px] md:h-[650px] border rounded-full flex items-center justify-center" style={{ borderColor: `${themeColor}11` }}>
                  <div className="w-[180px] h-[180px] md:w-[500px] md:h-[500px] border border-white/10 rounded-full animate-[spin_20s_linear_infinite] border-dashed"></div>
                </div>
              </div>
              {/* Crosshair */}
              <div className="absolute w-full h-px bg-white/5"></div>
              <div className="absolute h-full w-px bg-white/5"></div>
            </div>

            <div className="w-full flex justify-between items-center max-w-7xl relative z-40 px-4">
              <div className="space-y-16 md:space-y-24">
                <div className="group">
                  <div className="flex items-center gap-4 md:gap-8 mb-2 md:mb-4">
                    <div className="w-12 md:w-20 h-[1px]" style={{ backgroundColor: themeColor }}></div>
                    <div className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em]">1.2mm Pebble</div>
                  </div>
                  <p className="text-[8px] md:text-[10px] text-gray-500 max-w-[120px] md:max-w-[180px] ml-16 md:ml-28 opacity-60">Surface friction control.</p>
                </div>
                <div className="group">
                  <div className="flex items-center gap-4 md:gap-8 mb-2 md:mb-4">
                    <div className="w-12 md:w-20 h-[1px]" style={{ backgroundColor: themeColor }}></div>
                    <div className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em]">High-Tack</div>
                  </div>
                  <p className="text-[8px] md:text-[10px] text-gray-500 max-w-[120px] md:max-w-[180px] ml-16 md:ml-28 opacity-60">Moisture management.</p>
                </div>
              </div>
              <div className="space-y-16 md:space-y-24 text-right">
                <div className="group">
                  <div className="flex items-center gap-4 md:gap-8 justify-end mb-2 md:mb-4">
                    <div className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em]">12.8° Elev.</div>
                    <div className="w-12 md:w-20 h-[1px]" style={{ backgroundColor: themeColor }}></div>
                  </div>
                  <p className="text-[8px] md:text-[10px] text-gray-500 max-w-[120px] md:max-w-[180px] mr-16 md:mr-28 opacity-60 ml-auto">Optimal launch angle.</p>
                </div>
                <div className="group">
                  <div className="flex items-center gap-4 md:gap-8 justify-end mb-2 md:mb-4">
                    <div className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em]">45.2° Azim.</div>
                    <div className="w-12 md:w-20 h-[1px]" style={{ backgroundColor: themeColor }}></div>
                  </div>
                  <p className="text-[8px] md:text-[10px] text-gray-500 max-w-[120px] md:max-w-[180px] mr-16 md:mr-28 opacity-60 ml-auto">Rotational stability.</p>
                </div>
              </div>
            </div>

            <div className="text-center relative z-40">
              <div className="text-4xl md:text-6xl font-black mb-1 md:mb-3 tracking-tighter" style={{ color: themeColor }}>12.5%</div>
              <div className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] text-gray-500 font-black">Less Drag</div>
            </div>
          </section>

          {/* Section 5: The Champion */}
          <section className="h-screen w-full flex flex-col items-center justify-center snap-start px-12 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="text-center z-30 mb-20 md:mb-40"
            >
              <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter mb-8 md:mb-12 uppercase leading-none">The<br />Champion.</h2>
              <div className="flex justify-center gap-12 md:gap-32">
                <div className="text-center">
                  <div className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mb-2 md:mb-4" style={{ color: themeColor }}>Elite Tier</div>
                  <div className="text-2xl md:text-4xl font-black tracking-tighter">FIBA</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mb-2 md:mb-4" style={{ color: themeColor }}>Gold Standard</div>
                  <div className="text-2xl md:text-4xl font-black tracking-tighter">NBA</div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Section 6: Defy Gravity */}
          <section className="h-screen w-full flex flex-col items-center justify-center snap-start px-12 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to top, ${themeColor}11, transparent)` }}></div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center z-40"
            >
              <h2 className="text-6xl md:text-[14rem] font-black tracking-tighter mb-8 md:mb-12 uppercase leading-[0.8]">Defy<br />Gravity.</h2>
              <button
                className="text-white px-10 md:px-20 py-4 md:py-7 rounded-full font-black text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500"
                style={{
                  backgroundColor: themeColor,
                  boxShadow: `0 0 60px ${themeColor}66`
                }}
              >
                Shop Collection
              </button>
            </motion.div>

            <footer className="absolute bottom-8 md:bottom-12 w-full px-6 md:px-16 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 md:gap-8 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-600">
              <div className="flex flex-col items-center md:items-start gap-3 md:gap-4">
                <div className="flex gap-6 md:gap-8">
                  <a href="#" className="hover:text-white transition-colors">Instagram</a>
                  <a href="#" className="hover:text-white transition-colors">Twitter</a>
                  <a href="#" className="hover:text-white transition-colors">Facebook</a>
                </div>
                <div className="opacity-40 text-center md:text-left">© 2026 BASKET BALL STORE / PERFORMANCE DIVISION</div>
              </div>
              <div className="flex items-center gap-4 md:gap-6 opacity-60">
                <Shield className="w-3 h-3 md:w-4 md:h-4" />
                <span>Secure Checkout</span>
              </div>
            </footer>
          </section>


          {/* Floating Add to Cart Button */}
          <AnimatePresence>
            {showFloatingButton && (
              <motion.button
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.8 }}
                onClick={addToCart}
                className="fixed bottom-12 right-12 z-[100] w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-transform"
                style={{
                  backgroundColor: themeColor,
                  boxShadow: `0 0 30px ${themeColor}88`
                }}
              >
                <ShoppingCart className="w-8 h-8" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Global Background Accents */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] blur-[160px] rounded-full" style={{ backgroundColor: `${themeColor}11` }}></div>
          <div className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] blur-[160px] rounded-full" style={{ backgroundColor: `${themeColor}11` }}></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>
      </div>

      {/* Cart Drawer Component moved to root for maximum z-index priority */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onRemove={removeFromCart}
        themeColor={themeColor}
      />
    </div>
  );
};

export default App;
