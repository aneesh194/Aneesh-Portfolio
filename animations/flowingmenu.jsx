import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

function FlowingMenu({
  items = [],
  speed = 15,
  textColor = '#fff',
  bgColor = '#000000',
  marqueeBgColor = '#fff',
  marqueeTextColor = '#000000',
  borderColor = '#fff'
}) {
  return (
    <div className="w-full h-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      <nav className="flex flex-col h-full m-0 p-0">
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            {...item}
            index={idx}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isFirst={idx === 0}
          />
        ))}
      </nav>
    </div>
  );
}

function MenuItem({ link, text, image, speed, textColor, marqueeBgColor, marqueeTextColor, borderColor, isFirst, index }) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const animationRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);

  // Detect touch/mobile once
  const isMobile = useRef(
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || window.matchMedia('(hover: none)').matches)
  );

  const animationDefaults = { duration: 0.6, ease: 'expo' };

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = (mouseX - width / 2) ** 2 + mouseY ** 2;
    const bottomEdgeDist = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  // Calculate how many repetitions needed to fill viewport
  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part');
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [text, image]);

  // Set up the marquee scroll animation
  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part');
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1
      });
    };

    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, image, repetitions, speed]);

  // ── Mobile: trigger marquee on scroll via IntersectionObserver ──────────
  useEffect(() => {
    if (!isMobile.current) return;
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;

    let isIn = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isIn) {
          isIn = true;
          // Staggered sequence: each item waits for the previous one to almost finish its reveal
          gsap
            .timeline({ defaults: animationDefaults, delay: index * 0.8 })
            .set(marqueeRef.current, { y: '101%' }, 0)
            .set(marqueeInnerRef.current, { y: '-101%' }, 0)
            .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
        } else if (!entry.isIntersecting && isIn) {
          isIn = false;
          gsap
            .timeline({ defaults: animationDefaults })
            .to(marqueeRef.current, { y: '101%' }, 0)
            .to(marqueeInnerRef.current, { y: '-101%' }, 0);
        }
      },
      { threshold: 0.15 } // Trigger earlier as part of a sequence
    );

    observer.observe(itemRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Desktop: hover handlers ──────────────────────────────────────────────
  const handleMouseEnter = ev => {
    if (isMobile.current) return;
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };

  const handleMouseLeave = ev => {
    if (isMobile.current) return;
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  return (
    <div
      className="flex-1 relative overflow-hidden text-center"
      ref={itemRef}
      style={{ borderTop: isFirst ? 'none' : `1px solid ${borderColor}` }}
    >
      <a
        className="flex items-center justify-center h-full relative cursor-pointer uppercase no-underline font-semibold text-[2.2vh] sm:text-[4vh]"
        href={link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ color: textColor }}
      >
        {text}
      </a>
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"
        ref={marqueeRef}
        style={{ backgroundColor: marqueeBgColor }}
      >
        <div className="h-full w-fit flex" ref={marqueeInnerRef}>
          {[...Array(repetitions)].map((_, idx) => (
            <div className="marquee-part flex items-center flex-shrink-0" key={idx} style={{ color: marqueeTextColor }}>
              {/* Smaller text on mobile, full size on desktop */}
              <span className="whitespace-nowrap uppercase font-normal text-[2.2vh] sm:text-[4vh] leading-[1] px-[1vw]">
                {text}
              </span>
              {/* Smaller image pill on mobile */}
              <div
                className="w-[100px] h-[4.5vh] my-[1.2em] mx-[1.5vw] py-[0.5em] sm:w-[200px] sm:h-[7vh] sm:my-[2em] sm:mx-[2vw] sm:py-[1em] rounded-[50px] bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FlowingMenu;
