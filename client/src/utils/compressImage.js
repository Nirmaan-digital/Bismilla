// Shrink a phone photo before upload: longest side 1600px, JPEG ~80%.
// A 4 MB camera photo becomes ~250 KB — faster on mobile data and well
// under the server's 5 MB limit. Falls back to the original file if the
// browser can't decode it.
export const compressImage = (file, { maxSide = 1600, quality = 0.8 } = {}) =>
  new Promise((resolve) => {
    if (!file || !/^image\//.test(file.type)) return resolve(file);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) return resolve(file);
          resolve(new File([blob], (file.name || 'bill').replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
