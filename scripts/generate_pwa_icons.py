from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError as exc:
    raise SystemExit(
        "Pillow no esta instalado. Ejecuta: pip install pillow"
    ) from exc


def draw_icon(size: int, output: Path) -> None:
    img = Image.new("RGBA", (size, size), (25, 118, 210, 255))
    draw = ImageDraw.Draw(img)

    radius = int(size * 0.2)
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    img.putalpha(mask)

    heart_color = (227, 242, 253, 255)
    left = int(size * 0.22)
    top = int(size * 0.30)
    right = int(size * 0.78)
    bottom = int(size * 0.78)

    circle_size = int(size * 0.24)
    draw.pieslice((left, top, left + circle_size, top + circle_size), 180, 360, fill=heart_color)
    draw.pieslice((right - circle_size, top, right, top + circle_size), 180, 360, fill=heart_color)
    draw.polygon(
        [
            (left + int(size * 0.05), top + int(size * 0.15)),
            (right - int(size * 0.05), top + int(size * 0.15)),
            (size // 2, bottom),
        ],
        fill=heart_color,
    )

    line_color = (13, 71, 161, 255)
    y = int(size * 0.53)
    points = [
        (int(size * 0.16), y),
        (int(size * 0.30), y),
        (int(size * 0.36), int(size * 0.44)),
        (int(size * 0.46), int(size * 0.62)),
        (int(size * 0.54), int(size * 0.49)),
        (int(size * 0.60), int(size * 0.56)),
        (int(size * 0.84), y),
    ]
    draw.line(points, fill=line_color, width=max(3, int(size * 0.045)), joint="curve")

    img.save(output, format="PNG")


def main() -> None:
    public_dir = Path(__file__).resolve().parent.parent / "public"
    draw_icon(192, public_dir / "pwa-icon-192.png")
    draw_icon(512, public_dir / "pwa-icon-512.png")
    draw_icon(180, public_dir / "apple-touch-icon.png")
    print("Iconos PNG generados en /public")


if __name__ == "__main__":
    main()
