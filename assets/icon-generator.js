// 간단한 아이콘 생성 스크립트
const fs = require('fs');
const path = require('path');

// 기본 SVG 아이콘 생성 (지뢰찾기 테마)
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c0c0c0;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 배경 -->
  <rect width="256" height="256" fill="url(#bg)" stroke="#808080" stroke-width="4"/>
  
  <!-- 지뢰찾기 격자 -->
  <g stroke="#999" stroke-width="1" fill="none">
    <line x1="64" y1="64" x2="64" y2="192"/>
    <line x1="128" y1="64" x2="128" y2="192"/>
    <line x1="192" y1="64" x2="192" y2="192"/>
    <line x1="64" y1="64" x2="192" y2="64"/>
    <line x1="64" y1="128" x2="192" y2="128"/>
    <line x1="64" y1="192" x2="192" y2="192"/>
  </g>
  
  <!-- 지뢰 -->
  <circle cx="96" cy="96" r="12" fill="#333"/>
  <circle cx="160" cy="160" r="12" fill="#333"/>
  
  <!-- 깃발 -->
  <rect x="148" y="80" width="2" height="24" fill="#654321"/>
  <polygon points="150,80 150,88 162,84" fill="#ff0000"/>
  
  <!-- 숫자 -->
  <text x="96" y="180" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#0000ff" text-anchor="middle">1</text>
  <text x="160" y="116" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#008000" text-anchor="middle">2</text>
  
  <!-- 타이틀 -->
  <text x="128" y="40" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#333" text-anchor="middle">지뢰찾기</text>
</svg>
`;

// SVG 파일 저장
fs.writeFileSync(path.join(__dirname, 'icon.svg'), svgIcon);

console.log('SVG 아이콘이 생성되었습니다.');
console.log('PNG 변환을 위해 다음 명령을 실행하세요:');
console.log('1. 온라인 SVG to PNG 변환기 사용');
console.log('2. 또는 ImageMagick 설치 후:');
console.log('   convert icon.svg -resize 512x512 icon.png');
console.log('   convert icon.svg -resize 256x256 icon.ico');