// Reduce una foto ANTES de subirla: máximo 1600px de lado y calidad JPEG
// 82%. Una foto de celular de 4 MB queda en ~300 KB, casi sin diferencia
// visible. Si algo falla, devuelve la foto original sin tocarla.
export async function compressImage(file, { maxSize = 1600, quality = 0.82 } = {}) {
  try {
    if (!file.type.startsWith("image/")) return file;

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF"; // fondo blanco por si el PNG tenía transparencia
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );

    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}