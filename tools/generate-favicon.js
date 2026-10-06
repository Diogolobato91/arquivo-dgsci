const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function createPng(width, height, rgbaBuffer) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0; // filter None
    rgbaBuffer.copy(scanlines, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const idatChunk = makeChunk('IDAT', zlib.deflateSync(scanlines));
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function createIco(pngBuffer, width, height) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // ICO
  header.writeUInt16LE(1, 4); // 1 icon

  const dir = Buffer.alloc(16);
  dir[0] = width === 256 ? 0 : width;
  dir[1] = height === 256 ? 0 : height;
  dir[2] = 0;
  dir[3] = 0;
  dir.writeUInt16LE(1, 4);
  dir.writeUInt16LE(32, 6);
  dir.writeUInt32LE(pngBuffer.length, 8);
  dir.writeUInt32LE(22, 12); // header (6) + dir (16) = 22

  return Buffer.concat([header, dir, pngBuffer]);
}

function generateIcons(size = 32) {
  const rgba = Buffer.alloc(size * size * 4);
  const cx = (size - 1) / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = Math.abs(x - cx);

      // Limites do escudo
      const topY = 2;
      const botY = size - 3;
      if (y < topY || y > botY) continue;

      let halfWidth = 0;
      if (y < size * 0.45) {
        // Parte superior do escudo (leve arco)
        const t = (y - topY) / (size * 0.45 - topY);
        halfWidth = cx * (0.88 + 0.08 * t);
      } else {
        // Afunilamento para o bico inferior do escudo
        const t = (y - size * 0.45) / (botY - size * 0.45);
        halfWidth = cx * 0.96 * Math.max(0, 1 - Math.pow(t, 1.35));
      }

      if (dx > halfWidth) continue;

      // Distância da borda externa
      const distFromBorder = halfWidth - dx;
      const distFromTop = y - topY;
      const distFromBot = botY - y;
      const edgeDist = Math.min(distFromBorder, distFromTop, distFromBot);

      // Borda Dourada Externa
      if (edgeDist < 2.2) {
        rgba[idx] = 245;     // R
        rgba[idx + 1] = 158; // G
        rgba[idx + 2] = 11;  // B
        rgba[idx + 3] = 255; // Alpha
        continue;
      }

      // Filete Interno Dourado
      if (edgeDist >= 3.2 && edgeDist < 4.0) {
        rgba[idx] = 254;
        rgba[idx + 1] = 240;
        rgba[idx + 2] = 138;
        rgba[idx + 3] = 160;
        continue;
      }

      // Fundo Vermelho Operacional CBMPA (Degradê vertical)
      const gradT = (y - topY) / (botY - topY);
      let r = Math.round(220 - gradT * 80);
      let g = Math.round(38 - gradT * 15);
      let b = Math.round(38 - gradT * 15);

      // Machados cruzados em diagonal (silhueta dourada)
      const ax1 = Math.abs((x - cx) - (y - 16));
      const ax2 = Math.abs((x - cx) + (y - 16));
      if ((ax1 < 1.1 || ax2 < 1.1) && y >= 10 && y <= 22) {
        r = 217; g = 119; b = 6;
      }

      // Chama Central de Fogo
      const flameDistY = y - 18;
      const flameDistX = Math.abs(x - cx);
      if (y >= 11 && y <= 24) {
        const flameMaxW = 4.8 * (1 - Math.pow(Math.abs(y - 19) / 8, 1.8));
        if (flameDistX <= flameMaxW) {
          // Centro da chama
          if (flameDistX <= flameMaxW * 0.45 && y >= 14 && y <= 22) {
            // Núcleo branco/amarelo brilhante
            r = 255; g = 255; b = 255;
          } else if (flameDistX <= flameMaxW * 0.75) {
            // Amarelo dourado intenso
            r = 254; g = 240; b = 138;
          } else {
            // Laranja fogo
            r = 245; g = 158; b = 11;
          }
        }
      }

      // Estrela do Pará no topo (ponto dourado)
      if (y >= 4 && y <= 6 && dx <= 1.2) {
        r = 254; g = 240; b = 138;
      }

      rgba[idx] = r;
      rgba[idx + 1] = g;
      rgba[idx + 2] = b;
      rgba[idx + 3] = 255;
    }
  }

  const png = createPng(size, size, rgba);
  const ico = createIco(png, size, size);

  const rootDir = path.resolve(__dirname, '..');
  fs.writeFileSync(path.join(rootDir, 'favicon.png'), png);
  fs.writeFileSync(path.join(rootDir, 'favicon.ico'), ico);
  console.log(`Favicons gerados com sucesso: favicon.png e favicon.ico (${size}x${size})`);
}

generateIcons(32);
