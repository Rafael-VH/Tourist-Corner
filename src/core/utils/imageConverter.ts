interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function convertToWebP(
  file: File,
  options: ResizeOptions = {},
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo obtener contexto del canvas"));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

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

      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error("No se pudo cargar la imagen"));
    };

    img.src = URL.createObjectURL(file);
  });
}
