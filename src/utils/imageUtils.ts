
export async function resizeAndCompressImage(file: File, options = { maxWidth: 1200, quality: 0.8 }): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();

    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        // Calculate new size while maintaining aspect ratio
        let { width, height } = img;
        if (width > options.maxWidth) {
          height = Math.round((height * options.maxWidth) / width);
          width = options.maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Unable to get canvas context'));
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          },
          'image/jpeg',
          options.quality
        );
      };
      img.onerror = reject;
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
