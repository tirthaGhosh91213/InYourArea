import React, { useState, useEffect, useRef, useImperativeHandle } from "react";

// ============ SHADCN FIREWORKS INLINE CODE ============
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(Math.random() * (max - min) + min);
const randColor = () => `hsl(${randInt(0, 360)}, 100%, 50%)`;

function createParticle(x, y, color, speed, direction, gravity, friction, size) {
  const vx = Math.cos(direction) * speed;
  const vy = Math.sin(direction) * speed;
  const alpha = 1;
  const decay = rand(0.005, 0.02);

  return {
    x, y, color, speed, direction, vx, vy, gravity, friction, alpha, decay, size,
    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    },
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    },
    isAlive() {
      return this.alpha > 0;
    }
  };
}

function createFirework(x, y, targetY, color, speed, size, particleSpeed, particleSize, onExplode) {
  const angle = -Math.PI / 2 + rand(-0.3, 0.3);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  const trail = [];
  const trailLength = randInt(10, 25);

  return {
    x, y, targetY, color, speed, size, angle, vx, vy, trail, trailLength, exploded: false,
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.trailLength) this.trail.shift();
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.02;
      if (this.vy >= 0 || this.y <= this.targetY) {
        this.explode();
        return false;
      }
      return true;
    },
    explode() {
      const numParticles = randInt(50, 150);
      const particles = [];
      for (let i = 0; i < numParticles; i++) {
        const particleAngle = rand(0, Math.PI * 2);
        const localSpeed = typeof particleSpeed === 'number' ? particleSpeed : rand(particleSpeed.min, particleSpeed.max);
        const localSize = typeof particleSize === 'number' ? particleSize : rand(particleSize.min, particleSize.max);
        particles.push(createParticle(this.x, this.y, this.color, localSpeed, particleAngle, 0.05, 0.98, localSize));
      }
      onExplode(particles);
    },
    draw(ctx) {
      ctx.save();
      ctx.beginPath();
      if (this.trail.length > 1) {
        ctx.moveTo(this.trail[0]?.x ?? this.x, this.trail[0]?.y ?? this.y);
        for (const point of this.trail) ctx.lineTo(point.x, point.y);
      } else {
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y);
      }
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }
  };
}

function getValueByRange(range) {
  return typeof range === 'number' ? range : rand(range.min, range.max);
}

function getColor(color) {
  if (Array.isArray(color)) return color[randInt(0, color.length)] ?? randColor();
  return color ?? randColor();
}

// FIREWORKS COMPONENT
function FireworksBackground({
  className = "",
  population = 1,
  color,
  fireworkSpeed = { min: 4, max: 8 },
  fireworkSize = { min: 2, max: 5 },
  particleSpeed = { min: 2, max: 7 },
  particleSize = { min: 1, max: 5 }
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let maxX = window.innerWidth;
    let ratio = container.offsetHeight / container.offsetWidth;
    let maxY = maxX * ratio;
    canvas.width = maxX;
    canvas.height = maxY;

    const setCanvasSize = () => {
      maxX = window.innerWidth;
      ratio = container.offsetHeight / container.offsetWidth;
      maxY = maxX * ratio;
      canvas.width = maxX;
      canvas.height = maxY;
    };
    window.addEventListener('resize', setCanvasSize);

    const explosions = [];
    const fireworks = [];

    const handleExplosion = (particles) => explosions.push(...particles);

    const launchFirework = () => {
      const x = rand(maxX * 0.1, maxX * 0.9);
      const y = maxY;
      const targetY = rand(maxY * 0.1, maxY * 0.4);
      const fireworkColor = getColor(color);
      const speed = getValueByRange(fireworkSpeed);
      const size = getValueByRange(fireworkSize);
      fireworks.push(createFirework(x, y, targetY, fireworkColor, speed, size, particleSpeed, particleSize, handleExplosion));
      const timeout = rand(300, 800) / population;
      setTimeout(launchFirework, timeout);
    };

    launchFirework();

    let animationFrameId;
    const animate = () => {
      ctx.clearRect(0, 0, maxX, maxY);

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i];
        if (!firework?.update()) {
          fireworks.splice(i, 1);
        } else {
          firework.draw(ctx);
        }
      }

      for (let i = explosions.length - 1; i >= 0; i--) {
        const particle = explosions[i];
        particle?.update();
        if (particle?.isAlive()) {
          particle.draw(ctx);
        } else {
          explosions.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleClick = (event) => {
      const x = event.clientX;
      const y = maxY;
      const targetY = event.clientY;
      const fireworkColor = getColor(color);
      const speed = getValueByRange(fireworkSpeed);
      const size = getValueByRange(fireworkSize);
      fireworks.push(createFirework(x, y, targetY, fireworkColor, speed, size, particleSpeed, particleSize, handleExplosion));
    };

    container.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      container.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [population, color, fireworkSpeed, fireworkSize, particleSpeed, particleSize]);

  return (
    <div ref={containerRef} className={`relative size-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
// ============ END SHADCN FIREWORKS CODE ============

export default function NewYearModal() {
  const [showModal, setShowModal] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [hasSeenNY, setHasSeenNY] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const seenNY = localStorage.getItem('hasSeenNewYear2026');
    setHasSeenNY(seenNY === 'true');
    if (!seenNY) setShowModal(true);
  }, []);

  const handleCelebrate = () => {
    setShowModal(false);
    setShowFireworks(true);
    localStorage.setItem('hasSeenNewYear2026', 'true');
    setTimeout(() => setShowFireworks(false), 12000);
  };

  const handleClose = () => {
    setShowModal(false);
    localStorage.setItem('hasSeenNewYear2026', 'true');
  };

  return (
    <>
      {showModal && !hasSeenNY && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: isMobile ? '15px' : '40px', backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: isMobile ? '16px' : '20px',
            padding: isMobile ? '20px 15px' : '40px',
            textAlign: 'center', maxWidth: isMobile ? '300px' : '450px',
            width: '100%', maxHeight: '90vh', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
          }}>
            <img 
              src="/newyearposter.png" 
              alt="Happy New Year" 
              style={{ 
                width: '100%', height: 'auto', 
                borderRadius: isMobile ? '12px' : '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                marginBottom: isMobile ? '15px' : '30px'
              }} 
            />
            
            <h1 style={{ 
              color: 'white', 
              fontSize: isMobile ? '1.5rem' : '2.5rem',
              margin: isMobile ? '0 0 10px 0' : '0 0 20px 0',
              textShadow: '0 0 20px rgba(255,255,255,0.5)'
            }}>
              Happy New Year 2026! 🎉
            </h1>
            
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: isMobile ? '0.9rem' : '1.2rem',
              marginBottom: isMobile ? '20px' : '30px',
              lineHeight: '1.5'
            }}>
              Jharkhand Bihar Updates wishes you a prosperous year ahead! 🌟
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: isMobile ? '10px' : '15px',
              justifyContent: 'center', 
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button onClick={handleCelebrate} style={{
                background: 'linear-gradient(45deg, #FF6B6B, #FFD700)',
                color: 'white', padding: isMobile ? '12px 28px' : '15px 40px',
                border: 'none', borderRadius: '50px', fontSize: isMobile ? '0.95rem' : '1.1rem',
                fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 30px rgba(255,107,107,0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 15px 40px rgba(255,107,107,0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 10px 30px rgba(255,107,107,0.4)';
              }}>
                🎆 CELEBRATE!
              </button>
              
              <button onClick={handleClose} style={{
                background: 'rgba(255,255,255,0.2)', color: 'white',
                padding: isMobile ? '12px 24px' : '15px 30px', border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '50px', fontSize: isMobile ? '0.9rem' : '1rem',
                cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}>
                ✕ Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {showFireworks && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9998,
          pointerEvents: 'none'
        }}>
          <FireworksBackground
            className="absolute inset-0"
            population={isMobile ? 6 : 12}
            color={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']}
            fireworkSpeed={{ min: 4, max: 10 }}
            fireworkSize={{ min: 2, max: 5 }}
            particleSpeed={{ min: 3, max: 8 }}
            particleSize={{ min: 2, max: 6 }}
          />
        </div>
      )}
    </>
  );
}
