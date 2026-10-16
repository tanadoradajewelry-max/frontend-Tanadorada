import { useRef } from "react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal";

function StripCard({ category, index }) {
  const tiltRef = useRef(null);

  // Inclina la tarjeta hacia donde está el cursor y mueve el brillo.
  const handleMove = (event) => {
    // Solo con mouse: en el celular las tarjetas solo flotan.
    if (event.pointerType !== "mouse" || !tiltRef.current) return;

    const rect = tiltRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width; // 0 a 1
    const y = (event.clientY - rect.top) / rect.height; // 0 a 1
    const style = tiltRef.current.style;

    style.setProperty("--ry", `${(x - 0.5) * 18}deg`);
    style.setProperty("--rx", `${(0.5 - y) * 18}deg`);
    style.setProperty("--mx", `${x * 100}%`);
    style.setProperty("--my", `${y * 100}%`);
  };

  const handleLeave = () => {
    const style = tiltRef.current?.style;
    if (!style) return;
    style.setProperty("--rx", "0deg");
    style.setProperty("--ry", "0deg");
  };

  return (
    <Reveal
      as="div"
      className="strip-card-wrap"
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <Link
        to={category.href}
        className="strip-card"
        style={{ "--i": index }}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        <div className="strip-card-float">
          <div className="strip-card-tilt" ref={tiltRef}>
            <img src={category.image} alt={category.label} />
            <span className="strip-card-shine" />
          </div>
          <span className="strip-card-label">{category.label}</span>
        </div>
      </Link>
    </Reveal>
  );
}

export default function CategoryStrip({ items }) {
  if (!items?.length) return null;

  return (
    <div className="float-strip">
      {items.map((category, index) => (
        <StripCard
          key={`${category.label}-${index}`}
          category={category}
          index={index}
        />
      ))}
    </div>
  );
}
