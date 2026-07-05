export const compressImage = async (file: File, maxDim: number = 1600, quality: number = 0.8): Promise<File> => {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  const image = new Image();
  const url = URL.createObjectURL(file);
  image.src = url;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not load image"));
  });
  URL.revokeObjectURL(url);

  let width = image.naturalWidth;
  let height = image.naturalHeight;
  
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image for compression");
  
  // Fill with a background color for transparent images going to webp/jpeg
  ctx.fillStyle = "transparent"; // WebP supports transparency, so this is fine
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!blob) throw new Error("Could not compress image");
  
  const name = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${name}-optimized.webp`, { type: "image/webp" });
};
