export async function convertToWebP(file: File, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo obtener contexto del canvas"));
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("No se pudo convertir la imagen a WebP"));
            return;
          }
          const webpFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, "") + ".webp",
            { type: "image/webp" },
          );
          resolve(webpFile);
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => {
      reject(new Error("No se pudo cargar la imagen"));
    };

    img.src = URL.createObjectURL(file);
  });
}
