const MARKER = "/".charCodeAt(0);

function byteToBits(byte) {
  const bits = new Array(8);
  for (let i = 0; i < 8; i++) bits[i] = (byte >> i) & 1;
  return bits;
}

function bitsToByte(bits) {
  let num = 0;
  for (let i = 0; i < 8; i++) if (bits[i]) num += 2 ** i;
  return num;
}

function embedMarkerInPixel(data, idx, byte) {
  const bits = byteToBits(byte);
  data[idx] = (data[idx] & 0xfc) | bits[0] | (bits[1] << 1);
  data[idx + 1] = (data[idx + 1] & 0xf8) | bits[2] | (bits[3] << 1) | (bits[4] << 2);
  data[idx + 2] = (data[idx + 2] & 0xf8) | bits[5] | (bits[6] << 1) | (bits[7] << 2);
}

function readMarkerFromPixel(data, idx) {
  const bits = new Array(8);
  bits[0] = data[idx] & 1;
  bits[1] = (data[idx] >> 1) & 1;
  bits[2] = data[idx + 1] & 1;
  bits[3] = (data[idx + 1] >> 1) & 1;
  bits[4] = (data[idx + 1] >> 2) & 1;
  bits[5] = data[idx + 2] & 1;
  bits[6] = (data[idx + 2] >> 1) & 1;
  bits[7] = (data[idx + 2] >> 2) & 1;
  return bitsToByte(bits);
}

function embedByteInPixel(data, idx, byte) {
  embedMarkerInPixel(data, idx, byte);
}

function readByteFromPixel(data, idx) {
  return readMarkerFromPixel(data, idx);
}

function isEncrypted(imageData) {
  return readMarkerFromPixel(imageData.data, 0) === MARKER;
}

function writeCount(count, data, width) {
  const countStr = String(count).padStart(3, "0").slice(-3);
  for (let i = 0; i < 3; i++) {
    const x = i + 1;
    const idx = (0 * width + x) * 4;
    embedByteInPixel(data, idx, countStr.charCodeAt(i));
  }
}

function readCount(data, width) {
  const bytes = [];
  for (let i = 0; i < 3; i++) {
    const idx = (0 * width + (i + 1)) * 4;
    bytes.push(readByteFromPixel(data, idx));
  }
  return parseInt(String.fromCharCode(...bytes), 10);
}

function hideTextInImage(ctx, width, height, text) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const payload = new TextEncoder().encode(text);

  if (payload.length > width * height - 4) {
    throw new Error("Зображення замале для цього тексту.");
  }
  if (isEncrypted(imageData)) {
    throw new Error("Файл уже містить приховані дані.");
  }

  embedMarkerInPixel(data, 0, MARKER);
  writeCount(payload.length, data, width);

  let index = 0;
  outer: for (let x = 4; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (index >= payload.length) break outer;
      const idx = (y * width + x) * 4;
      embedByteInPixel(data, idx, payload[index++]);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return imageData;
}

function extractTextFromImage(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  if (!isEncrypted(imageData)) {
    throw new Error("У файлі відсутня зашифрована інформація.");
  }

  const count = readCount(data, width);
  const message = new Uint8Array(count);
  let index = 0;

  outer: for (let x = 4; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (index >= count) break outer;
      const idx = (y * width + x) * 4;
      message[index++] = readByteFromPixel(data, idx);
    }
  }

  return new TextDecoder().decode(message);
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}
