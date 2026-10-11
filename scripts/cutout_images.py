"""Détoure les photos produits (rembg, modèle u2net) et les met en cache.

    ..\\ContextPlus\\.venv-rembg\\Scripts\\python scripts\\cutout_images.py

Pour chaque image du catalogue : PNG transparent recadré au plus juste dans
<CATALOGUE_ROOT>/_cutouts/<md5>.png (cache : une image déjà traitée n'est pas refaite).
Écrit aussi _cutouts/report.json (mesures utilisées pour repérer les détourages douteux).
"""
import hashlib
import io
import json
import os
import sys
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

PROJECT = Path(__file__).resolve().parent.parent
ROOT = Path(os.environ.get("CATALOGUE_ROOT", PROJECT.parent / "ContextPlus")).resolve()
CACHE = ROOT / "_cutouts"


def main() -> None:
    catalogue = json.loads((ROOT / "catalogue" / "catalogue.json").read_text(encoding="utf-8"))
    CACHE.mkdir(exist_ok=True)
    report_file = CACHE / "report.json"
    report = json.loads(report_file.read_text(encoding="utf-8")) if report_file.exists() else {}
    session = None
    paths = sorted({img for p in catalogue["products"] for img in p["images"]})
    for i, rel in enumerate(paths, 1):
        data = (ROOT / rel).read_bytes()  # lecture via Python : chemins Windows > 260 caractères OK
        digest = hashlib.md5(data).hexdigest()
        out = CACHE / f"{digest}.png"
        if out.exists() and digest in report:
            continue
        session = session or new_session("u2net")
        src = Image.open(io.BytesIO(data)).convert("RGBA")
        cut = remove(src, session=session)
        alpha = cut.getchannel("A")
        bbox = alpha.point(lambda a: 255 if a > 16 else 0).getbbox()
        if bbox:
            cut = cut.crop(bbox)
        w, h = src.size
        hist = alpha.histogram()
        opaque = sum(hist[200:]) / (w * h)
        partial = sum(hist[17:200]) / (w * h)
        cut.save(out)
        report[digest] = {
            "source": rel,
            "size": [w, h],
            "bbox": list(bbox) if bbox else None,
            # part de l'image gardée, part semi-transparente (bords flous = détourage incertain)
            "opaque": round(opaque, 3),
            "partial": round(partial, 3),
        }
        if i % 20 == 0:
            print(f"  {i}/{len(paths)}", flush=True)
            report_file.write_text(json.dumps(report, indent=1), encoding="utf-8")
    report_file.write_text(json.dumps(report, indent=1), encoding="utf-8")
    print(f"{len(paths)} images, cache : {CACHE}")


if __name__ == "__main__":
    sys.exit(main())
