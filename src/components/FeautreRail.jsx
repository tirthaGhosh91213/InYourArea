// src/components/FeatureRailSmall.jsx
import React, { useRef, useLayoutEffect, useState, forwardRef } from "react";
import { motion } from "framer-motion";
import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import img3 from "../assets/img3.png";
import img4 from "../assets/img4.png";

const ACCENT = {
  green: "#0ea77a",
  line: "#CFE3DC",
};

// Build curved connector line
function buildQuadraticPath(sx, sy, ex, ey) {
  const hook = 30;
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  return `M ${sx} ${sy} Q ${sx} ${sy + hook}, ${mx} ${my} T ${ex} ${ey}`;
}

// Card Component
const SmallCard = forwardRef(function SmallCard({ src }, ref) {
  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.05, rotate: 1 }}
      transition={{ type: "spring", stiffness: 150, damping: 12 }}
      className="mx-auto md:mx-0 w-full max-w-[300px] md:max-w-[320px] z-10"
    >
      <div className="relative bg-white/80 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden hover:shadow-[0_25px_80px_rgba(0,0,0,0.15)] transition-all duration-500">
        <div className="relative aspect-[4/5] min-h-[220px]">
          <motion.img
            src={src}
            alt="Feature preview"
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: 1.1, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="h-9 bg-white/70 backdrop-blur-sm" />
      </div>
    </motion.div>
  );
});

// Single feature row
function FeatureRow({ icon, title, text, flip = false, src, cardRef }) {
  return (
    <section className="relative py-10 md:py-20">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-12 items-center gap-y-10 md:gap-12"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div
          className={`md:col-span-6 ${flip ? "md:order-2" : "md:order-1"} text-center md:text-left`}
        >
          <motion.div
            className="flex items-center justify-center md:justify-start gap-3 mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold shadow-md"
              style={{ backgroundColor: ACCENT.green, color: "white" }}
            >
              {icon}
            </span>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-800 bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
              {title}
            </h2>
          </motion.div>
          <p className="text-slate-600 leading-relaxed text-lg max-w-lg mx-auto md:mx-0">
            {text}
          </p>
        </div>
        <div className={`md:col-span-6 ${flip ? "md:order-1" : "md:order-2"}`}>
          <SmallCard src={src} ref={cardRef} />
        </div>
      </motion.div>
    </section>
  );
}

// Main component
export default function FeatureRailSmall() {
  const items = [
    {
      icon: "📰",
      title: "Local News",
      text:
        "Latest local reporting and social snippets aggregated into quick-glance cards so key updates never get missed.",
      flip: false,
      src: img1,
    },
    {
      icon: "👥",
      title: "Community",
      text:
        "Ask, answer, and share with neighbors in a friendly, local-first space designed for everyday updates.",
      flip: true,
      src: img2,
    },
    {
      icon: "💼",
      title: "Jobs",
      text:
        "Discover roles from nearby employers with compact listings optimized for quick scanning and saving.",
      flip: false,
      src: img3,
    },
    {
      icon: "📅",
      title: "Events",
      text:
        "From meetups to markets, browse upcoming activities with tidy cards that surface what matters soonest.",
      flip: true,
      src: img4,
    },
  ];

  const containerRef = useRef(null);
  const cardRefs = useRef(items.map(() => React.createRef()));
  const [{ w, h }, setSize] = useState({ w: 0, h: 0 });
  const [paths, setPaths] = useState([]);

  useLayoutEffect(() => {
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      const cbox = el.getBoundingClientRect();
      setSize({ w: cbox.width, h: cbox.height });

      const boxes = cardRefs.current.map((r) => r.current?.getBoundingClientRect());
      if (boxes.some((b) => !b)) return;

      const next = [];
      for (let i = 0; i < boxes.length - 1; i++) {
        const a = boxes[i];
        const b = boxes[i + 1];
        const sx = a.left - cbox.left + a.width * 0.5;
        const sy = a.bottom - cbox.top + 12;
        const ex = b.left - cbox.left + b.width * 0.5;
        const ey = b.top - cbox.top - 12;
        next.push({ d: buildQuadraticPath(sx, sy, ex, ey), sx, sy, ex, ey });
      }
      setPaths(next);
    }

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);

    const imgs = containerRef.current?.querySelectorAll("img") ?? [];
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", measure, { once: true });
    });

    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto max-w-6xl px-6 md:px-8 py-10 md:py-20"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-teal-50 to-white -z-10 animate-gradientMove" />

      {/* Connector lines */}
      <svg
        className="pointer-events-none absolute inset-0 z-30"
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        fill="none"
      >
        {paths.map((p, i) => (
          <motion.g
            key={i}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: i * 0.3 }}
            viewport={{ once: true }}
            shapeRendering="geometricPrecision"
          >
            <motion.path
              d={p.d}
              stroke={ACCENT.line}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.06))" }}
            />
            <motion.circle
              cx={p.sx}
              cy={p.sy}
              r={6}
              fill={ACCENT.green}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.circle
              cx={p.ex}
              cy={p.ey}
              r={6}
              fill={ACCENT.green}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </motion.g>
        ))}
      </svg>

      {/* Feature Rows */}
      {items.map((it, idx) => (
        <div key={it.title} className="relative">
          <FeatureRow {...it} cardRef={cardRefs.current[idx]} />
        </div>
      ))}

      {/* CTA Section */}
      <motion.section
        className="text-center mt-14 mb-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <h3 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-teal-700 to-emerald-500 bg-clip-text text-transparent">
          And so much more!
        </h3>
        <p className="mt-3 text-slate-600 max-w-3xl mx-auto px-4 text-lg">
          There is so much more we can list… It would be a lot easier to see
          what’s on offer by simply entering your postcode!
        </p>

        {/* Postcode Input — styled like Hero section */}
      </motion.section>

      {/* Floating gradient animation */}
      <style jsx>{`
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradientMove {
          background-size: 400% 400%;
          animation: gradientMove 15s ease infinite;
        }
      `}</style>
    </div>
  );
}
