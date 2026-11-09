export const MAX_PROOF_BYTES = 1024 * 1024; // 1 MB, as stated on the billing section
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That image could not be read.')); };
    img.src = url;
  });
}

// Phone screenshots are often 2-4 MB. Shrink images so they fit the 1 MB limit.
async function shrinkImage(file) {
  const img = await loadImage(file);
  let scale = Math.min(1, 1600 / Math.max(img.width, img.height));
  for (let q = 0.85; q >= 0.4; q -= 0.15) {
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', q));
    if (blob && blob.size <= MAX_PROOF_BYTES) {
      return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
    }
    scale *= 0.8;
  }
  throw new Error('That image is too large. Please upload a smaller screenshot.');
}

// Returns a File that is guaranteed to be <= 1 MB, or throws a friendly error.
export async function prepareProof(file) {
  if (!OK_TYPES.includes(file.type)) throw new Error('Please upload a JPG, PNG or PDF file.');
  if (file.size <= MAX_PROOF_BYTES) return file;
  if (file.type === 'application/pdf') throw new Error('PDF is larger than 1 MB. Upload a screenshot instead.');
  return shrinkImage(file);
}
