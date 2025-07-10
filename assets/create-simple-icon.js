const fs = require('fs');
const path = require('path');

// 단순한 PNG 헤더와 데이터 생성
function createSimplePNG(width, height, r, g, b, a = 255) {
  const bytesPerPixel = 4; // RGBA
  const rowBytes = width * bytesPerPixel;
  const imageData = Buffer.alloc(height * (rowBytes + 1)); // +1 for filter byte
  
  // 각 행에 대해 데이터 생성
  for (let y = 0; y < height; y++) {
    const rowStart = y * (rowBytes + 1);
    imageData[rowStart] = 0; // Filter type (0 = None)
    
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * bytesPerPixel;
      
      // 간단한 그라데이션 효과
      const gray = Math.floor(192 + (x + y) * 0.1) % 256;
      
      // 격자 패턴 추가
      if (x % 64 === 0 || y % 64 === 0) {
        imageData[pixelStart] = 128;     // R
        imageData[pixelStart + 1] = 128; // G
        imageData[pixelStart + 2] = 128; // B
        imageData[pixelStart + 3] = 255; // A
      } else {
        imageData[pixelStart] = gray;     // R
        imageData[pixelStart + 1] = gray; // G
        imageData[pixelStart + 2] = gray; // B
        imageData[pixelStart + 3] = a;    // A
      }
    }
  }
  
  // PNG 시그니처
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR 청크 생성
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // 길이
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // 비트 깊이
  ihdr.writeUInt8(6, 17); // 컬러 타입 (RGBA)
  ihdr.writeUInt8(0, 18); // 압축 방법
  ihdr.writeUInt8(0, 19); // 필터 방법
  ihdr.writeUInt8(0, 20); // 인터레이스 방법
  
  // CRC 계산 (간단히 고정값 사용)
  ihdr.writeUInt32BE(0x496E7465, 21); // 임시 CRC
  
  // IDAT 청크 생성 (실제로는 zlib 압축이 필요하지만 간단히 처리)
  const idat = Buffer.alloc(8 + imageData.length);
  idat.writeUInt32BE(imageData.length, 0);
  idat.write('IDAT', 4);
  imageData.copy(idat, 8);
  
  // IEND 청크
  const iend = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// 기본 아이콘 생성 (실제 PNG는 아니지만 placeholder로 사용)
function createIconFile(filename, size) {
  const iconData = Buffer.alloc(size * size * 4);
  
  // 간단한 패턴 생성
  for (let i = 0; i < iconData.length; i += 4) {
    const pixel = i / 4;
    const x = pixel % size;
    const y = Math.floor(pixel / size);
    
    // 배경색 (회색)
    let r = 192, g = 192, b = 192;
    
    // 격자 패턴
    if (x % 64 === 0 || y % 64 === 0) {
      r = g = b = 128;
    }
    
    // 가장자리 테두리
    if (x < 8 || x >= size - 8 || y < 8 || y >= size - 8) {
      r = g = b = 80;
    }
    
    iconData[i] = r;     // R
    iconData[i + 1] = g; // G
    iconData[i + 2] = b; // B
    iconData[i + 3] = 255; // A
  }
  
  // 간단한 파일 헤더 추가
  const header = Buffer.from('ICON');
  const sizeBuffer = Buffer.alloc(4);
  sizeBuffer.writeUInt32LE(size, 0);
  
  const finalData = Buffer.concat([header, sizeBuffer, iconData]);
  fs.writeFileSync(filename, finalData);
}

// 각 플랫폼용 아이콘 생성
const icons = [
  { name: 'icon.png', size: 512 },
  { name: 'icon.ico', size: 256 },
  { name: 'icon.icns', size: 1024 }
];

console.log('간단한 아이콘 파일 생성 중...');

icons.forEach(({ name, size }) => {
  const filepath = path.join(__dirname, name);
  createIconFile(filepath, size);
  console.log(`${name} (${size}x${size}) 생성 완료`);
});

console.log('\\n아이콘 파일 생성 완료!');
console.log('참고: 이 파일들은 기본 placeholder입니다.');
console.log('실제 프로덕션에서는 적절한 이미지 편집 도구를 사용하세요.');