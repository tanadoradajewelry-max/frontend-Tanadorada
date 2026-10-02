import { useReveal } from "../hooks/useReveal";

// Uso: <Reveal><h2>Título</h2></Reveal>
// Es el equivalente directo a poner data-aos="fade-up" en el HTML original.
export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  ...rest
}) {
  const { ref, isVisible } = useReveal();

  return (
    <Tag
      ref={ref}
      className={`reveal ${isVisible ? "reveal--visible" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
