// Convierte el texto de la descripción en párrafos y viñetas:
//   - Una línea normal = un párrafo.
//   - Una línea que empieza con "- " (o "• ") = una viñeta.
// Todo se muestra como TEXTO normal, nunca como HTML, así que lo que se
// escriba en el panel no puede colar código en la tienda.
function parseDescription(text) {
  const blocks = [];
  let list = null;

  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      list = null;
      continue;
    }

    const bullet = line.match(/^[-•*]\s+(.*)$/);

    if (bullet) {
      if (!list) {
        list = { type: "list", items: [] };
        blocks.push(list);
      }
      list.items.push(bullet[1]);
    } else {
      list = null;
      blocks.push({ type: "text", text: line });
    }
  }

  return blocks;
}

export default function ProductDescription({ text }) {
  const blocks = parseDescription(text);
  if (blocks.length === 0) return null;

  return (
    <div className="product-description">
      {blocks.map((block, index) =>
        block.type === "list" ? (
          <ul key={index}>
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={index}>{block.text}</p>
        )
      )}
    </div>
  );
}