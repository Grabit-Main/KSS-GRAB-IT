import math
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

def generate_3d_suggest_image(output_path, size=512):
    # Create high-res 512x512 RGBA canvas
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    
    # 1. Render Soft 3D Floor Shadow
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_shadow = ImageDraw.Draw(shadow)
    draw_shadow.ellipse([100, 410, 412, 470], fill=(0, 113, 227, 80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    img = Image.alpha_composite(img, shadow)

    # 2. Render 3D Floating Grocery Basket Base
    basket = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_b = ImageDraw.Draw(basket)
    
    # Basket body (Trapezoid with rounded corners)
    b_pts = [(130, 290), (382, 290), (350, 420), (162, 420)]
    draw_b.polygon(b_pts, fill=(0, 113, 227, 245))
    
    # Basket Rim (3D Ellipse)
    draw_b.ellipse([110, 275, 402, 305], fill=(56, 189, 248, 255), outline=(255, 255, 255, 255), width=4)
    draw_b.ellipse([130, 282, 382, 298], fill=(0, 87, 184, 255))
    
    # Basket Grid Lines
    for x in range(160, 360, 40):
        draw_b.line([(x, 290), (x - 15, 415)], fill=(255, 255, 255, 100), width=3)
    for y in range(320, 410, 30):
        draw_b.line([(140, y), (372, y)], fill=(255, 255, 255, 70), width=2)
        
    img = Image.alpha_composite(img, basket)

    # 3. Ray-Traced Glossy 3D Lightbulb Sphere
    bulb_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx, cy, r = 256, 200, 115
    
    # Render pixel-by-pixel 3D Sphere Shading
    px = bulb_layer.load()
    light_dir = (-0.5, -0.6, 0.6)
    # normalize light
    l_len = math.sqrt(light_dir[0]**2 + light_dir[1]**2 + light_dir[2]**2)
    lx, ly, lz = light_dir[0]/l_len, light_dir[1]/l_len, light_dir[2]/l_len
    
    for y_i in range(cy - r - 10, cy + r + 10):
        for x_i in range(cx - r - 10, cx + r + 10):
            dx = (x_i - cx) / r
            dy = (y_i - cy) / r
            dist_sq = dx*dx + dy*dy
            if dist_sq <= 1.0:
                dz = math.sqrt(1.0 - dist_sq)
                # Normal vector
                nx, ny, nz = dx, dy, dz
                
                # Diffuse
                dot = max(0.0, nx*lx + ny*ly + nz*lz)
                
                # Specular (reflection)
                rx = 2 * dot * nx - lx
                ry = 2 * dot * ny - ly
                rz = 2 * dot * nz - lz
                spec = max(0.0, rz) ** 24
                
                # Fresnel Rim Glow
                rim = (1.0 - nz) ** 3
                
                # Base Color Palette: Cyan to Royal Blue to Navy
                red = int(14 + dot * 40 + spec * 200 + rim * 30)
                green = int(113 + dot * 70 + spec * 220 + rim * 120)
                blue = int(227 + dot * 28 + spec * 28 + rim * 28)
                
                red = min(255, max(0, red))
                green = min(255, max(0, green))
                blue = min(255, max(0, blue))
                
                # Alpha smoothing at edges
                edge_alpha = 255
                if dist_sq > 0.92:
                    edge_alpha = int(255 * (1.0 - dist_sq) / 0.08)
                
                px[x_i, y_i] = (red, green, blue, edge_alpha)
                
    img = Image.alpha_composite(img, bulb_layer)

    # 4. Golden Glowing Filament inside bulb
    fil = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_f = ImageDraw.Draw(fil)
    
    # Outer Gold Glow
    draw_f.ellipse([216, 160, 296, 240], fill=(253, 224, 71, 180))
    fil = fil.filter(ImageFilter.GaussianBlur(18))
    img = Image.alpha_composite(img, fil)

    # Sharp Golden Starburst Filament
    star_fil = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_sf = ImageDraw.Draw(star_fil)
    draw_sf.ellipse([236, 180, 276, 220], fill=(255, 255, 255, 255), outline=(250, 204, 21, 255), width=3)
    draw_sf.line([(256, 170), (256, 230)], fill=(255, 235, 59, 255), width=4)
    draw_sf.line([(226, 200), (286, 200)], fill=(255, 235, 59, 255), width=4)
    img = Image.alpha_composite(img, star_fil)

    # 5. Metallic Gold Screw Base
    screw = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_s = ImageDraw.Draw(screw)
    
    # 3D Metallic Ribs
    ribs = [(210, 305, 302, 325), (216, 323, 296, 341), (222, 339, 290, 355)]
    for rx1, ry1, rx2, ry2 in ribs:
        draw_s.ellipse([rx1, ry1, rx2, ry2], fill=(234, 179, 8, 255), outline=(254, 240, 138, 255), width=2)
        # Specular shine band on screw
        draw_s.rectangle([rx1 + 30, ry1 + 2, rx1 + 45, ry2 - 2], fill=(255, 255, 255, 180))
        
    img = Image.alpha_composite(img, screw)

    # 6. Add 3D Golden Magic Sparkles around Bulb
    sparkles = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_sp = ImageDraw.Draw(sparkles)
    
    def draw_star(dx, dy, s_size, color):
        pts = [
            (dx, dy - s_size), (dx + s_size*0.3, dy - s_size*0.3),
            (dx + s_size, dy), (dx + s_size*0.3, dy + s_size*0.3),
            (dx, dy + s_size), (dx - s_size*0.3, dy + s_size*0.3),
            (dx - s_size, dy), (dx - s_size*0.3, dy - s_size*0.3)
        ]
        draw_sp.polygon(pts, fill=color)

    draw_star(110, 110, 24, (253, 224, 71, 255))
    draw_star(395, 130, 28, (250, 204, 21, 255))
    draw_star(420, 270, 18, (56, 189, 248, 255))
    draw_star(90, 260, 20, (253, 224, 71, 240))
    draw_star(330, 80, 16, (255, 255, 255, 255))

    img = Image.alpha_composite(img, sparkles)

    # Save to disk
    img.save(output_path, "PNG")
    print(f"Successfully generated 3D image at: {output_path}")

if __name__ == "__main__":
    generate_3d_suggest_image(r"c:\Users\HP\Desktop\Akash\Grabit\frontend\public\suggest-product-3d.png")
