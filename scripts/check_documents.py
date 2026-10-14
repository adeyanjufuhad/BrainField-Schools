"""Check document links, Mermaid consistency, assets, and PDF text."""
from pathlib import Path
import re
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
errors = []

for markdown in [ROOT / "README.md", ROOT / "DESIGN.md", ROOT / "CONTRIBUTING.md", *sorted((ROOT / "docs").glob("*.md"))]:
    source = markdown.read_text(encoding="utf-8")
    for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", source):
        if target.startswith(("http:", "https:", "#", "mailto:")):
            continue
        if not (markdown.parent / target.split("#")[0]).exists():
            errors.append(f"Missing local link from {markdown.name}: {target}")

architecture = (ROOT / "docs" / "SYSTEM-ARCHITECTURE.md").read_text(encoding="utf-8")
blocks = re.findall(r"```mermaid\n(.*?)\n```", architecture, re.S)
if len(blocks) < 6:
    errors.append("Expected at least six architecture diagrams.")
for index, block in enumerate(blocks, 1):
    name = f"architecture-{index:02d}"
    source = ROOT / "docs" / "diagrams" / f"{name}.mmd"
    if not source.exists() or source.read_text(encoding="utf-8").strip() != block.strip():
        errors.append(f"Mermaid source differs from architecture: {name}")
    for extension in ("png", "svg"):
        asset = ROOT / "docs" / "diagrams" / "rendered" / f"{name}.{extension}"
        if not asset.exists() or asset.stat().st_size < 100:
            errors.append(f"Missing/empty render: {asset.name}")

for filename, required in [
    ("BrainField-Schools-System-Architecture.pdf", ["System Architecture", "Director dashboard", "Payments and financial integrity", "Privacy, security", "Primary references"]),
    ("BrainField-Schools-Build-Guide.pdf", ["Practical Build Guide", "Local setup", "Meaningful test plan", "Budget and selling", "Official references"]),
]:
    path = ROOT / "docs" / filename
    if not path.exists():
        errors.append(f"Missing PDF: {filename}")
        continue
    reader = PdfReader(path)
    full_text = "\n".join(page.extract_text() or "" for page in reader.pages)
    for phrase in required:
        if phrase not in full_text:
            errors.append(f"PDF content missing: {phrase}")
    if len(reader.pages) < 5:
        errors.append(f"Unexpectedly short PDF: {filename}")
    print(f"{filename}: {len(reader.pages)} pages, {len(full_text):,} extracted characters")

if errors:
    raise SystemExit("\n".join(errors))
print(f"Verified local document links, {len(blocks)} Mermaid sources/renders, and both PDFs.")
