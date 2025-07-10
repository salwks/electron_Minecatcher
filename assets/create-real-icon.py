#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

# 512x512 PNG 아이콘 생성
def create_minesweeper_icon():
    # 이미지 크기
    size = 512
    
    # 새 이미지 생성 (흰색 배경)
    img = Image.new('RGBA', (size, size), (240, 240, 240, 255))
    draw = ImageDraw.Draw(img)
    
    # 배경 그라데이션 효과
    for i in range(size):
        alpha = int(255 * (1 - i / size) * 0.1)
        color = (200, 200, 200, alpha)
        draw.line([(0, i), (size, i)], fill=color)
    
    # 테두리
    border_width = 8
    draw.rectangle([0, 0, size-1, size-1], outline=(128, 128, 128, 255), width=border_width)
    
    # 격자 그리기
    cell_size = size // 8
    for i in range(1, 8):
        x = i * cell_size
        y = i * cell_size
        draw.line([(x, border_width), (x, size-border_width)], fill=(150, 150, 150, 255), width=2)
        draw.line([(border_width, y), (size-border_width, y)], fill=(150, 150, 150, 255), width=2)
    
    # 지뢰 그리기 (몇 개 위치에)
    mine_positions = [(2, 2), (5, 4), (3, 6)]
    for mx, my in mine_positions:
        x = mx * cell_size + cell_size // 2
        y = my * cell_size + cell_size // 2
        radius = cell_size // 4
        draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=(64, 64, 64, 255))
    
    # 깃발 그리기
    flag_x = 4 * cell_size + cell_size // 2
    flag_y = 3 * cell_size + cell_size // 2
    pole_width = 3
    pole_height = cell_size // 2
    
    # 깃발 막대
    draw.rectangle([flag_x - pole_width//2, flag_y - pole_height//2, 
                   flag_x + pole_width//2, flag_y + pole_height//2], 
                  fill=(101, 67, 33, 255))
    
    # 깃발 천
    flag_points = [(flag_x, flag_y - pole_height//2),
                   (flag_x + cell_size//3, flag_y - pole_height//4),
                   (flag_x, flag_y)]
    draw.polygon(flag_points, fill=(255, 0, 0, 255))
    
    # 숫자 그리기
    number_positions = [(1, 1, '1'), (6, 2, '2'), (4, 5, '3')]
    for nx, ny, num in number_positions:
        x = nx * cell_size + cell_size // 2
        y = ny * cell_size + cell_size // 2
        
        # 숫자 색상
        colors = {'1': (0, 0, 255, 255), '2': (0, 128, 0, 255), '3': (255, 0, 0, 255)}
        color = colors.get(num, (0, 0, 0, 255))
        
        try:
            font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', size=cell_size//2)
        except:
            font = ImageFont.load_default()
        
        # 텍스트 중앙 정렬
        bbox = draw.textbbox((0, 0), num, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        text_x = x - text_width // 2
        text_y = y - text_height // 2
        
        draw.text((text_x, text_y), num, fill=color, font=font)
    
    # 파일 저장
    img.save('assets/icon.png', 'PNG')
    print("512x512 PNG 아이콘 생성 완료: assets/icon.png")
    
    # 다른 크기도 생성
    # ICO용 (256x256)
    ico_img = img.resize((256, 256), Image.Resampling.LANCZOS)
    ico_img.save('assets/icon.ico', 'ICO')
    print("256x256 ICO 아이콘 생성 완료: assets/icon.ico")
    
    # ICNS용 (1024x1024)  
    icns_img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    icns_img.save('assets/icon_1024.png', 'PNG')
    print("1024x1024 PNG 아이콘 생성 완료: assets/icon_1024.png")
    print("ICNS 변환을 위해 다음 명령을 실행하세요:")
    print("mkdir icon.iconset")
    print("sips -z 1024 1024 assets/icon_1024.png --out icon.iconset/icon_512x512@2x.png")
    print("sips -z 512 512 assets/icon.png --out icon.iconset/icon_512x512.png")
    print("sips -z 512 512 assets/icon.png --out icon.iconset/icon_256x256@2x.png")
    print("sips -z 256 256 assets/icon.png --out icon.iconset/icon_256x256.png")
    print("sips -z 256 256 assets/icon.png --out icon.iconset/icon_128x128@2x.png")
    print("sips -z 128 128 assets/icon.png --out icon.iconset/icon_128x128.png")
    print("sips -z 64 64 assets/icon.png --out icon.iconset/icon_32x32@2x.png")
    print("sips -z 32 32 assets/icon.png --out icon.iconset/icon_32x32.png")
    print("sips -z 32 32 assets/icon.png --out icon.iconset/icon_16x16@2x.png")
    print("sips -z 16 16 assets/icon.png --out icon.iconset/icon_16x16.png")
    print("iconutil -c icns icon.iconset -o assets/icon.icns")

if __name__ == "__main__":
    create_minesweeper_icon()