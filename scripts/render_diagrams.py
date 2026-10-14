"""Extract architecture Mermaid blocks and render using the pinned Mermaid CLI."""
from pathlib import Path
import json
import os
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
DIAGRAMS = ROOT / "docs" / "diagrams"
RENDERED = DIAGRAMS / "rendered"


def architecture_blocks():
    source = (ROOT / "docs" / "SYSTEM-ARCHITECTURE.md").read_text(encoding="utf-8")
    return re.findall(r"```mermaid\n(.*?)\n```", source, re.S)


def main():
    DIAGRAMS.mkdir(exist_ok=True)
    RENDERED.mkdir(exist_ok=True)
    cli = ROOT / "node_modules" / "@mermaid-js" / "mermaid-cli" / "src" / "cli.js"
    if not cli.exists():
        raise SystemExit("Install documentation dependencies with npm ci first.")
    browser = os.environ.get("PUPPETEER_EXECUTABLE_PATH")
    if not browser and os.name == "nt":
        for candidate in [r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                          r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"]:
            if Path(candidate).exists():
                browser = candidate
                break
    config = {"theme": "base", "themeVariables": {
        "primaryColor": "#f3f6ee", "primaryTextColor": "#386641",
        "primaryBorderColor": "#386641", "lineColor": "#386641",
        "secondaryColor": "#a7c957", "tertiaryColor": "#ffffff",
        "fontFamily": "Arial, sans-serif", "fontSize": "18px"},
        "flowchart": {"htmlLabels": False, "curve": "linear"},
        "sequence": {"useMaxWidth": False, "wrap": True, "actorMargin": 35},
        "er": {"fontSize": 16}}
    with tempfile.TemporaryDirectory(prefix="brainfield-mermaid-") as temp:
        temp = Path(temp)
        config_path = temp / "mermaid.json"
        config_path.write_text(json.dumps(config), encoding="utf-8")
        puppet = temp / "puppeteer.json"
        puppet.write_text(json.dumps({"executablePath": browser} if browser else {}), encoding="utf-8")
        for index, block in enumerate(architecture_blocks(), 1):
            name = f"architecture-{index:02d}"
            source_path = DIAGRAMS / f"{name}.mmd"
            unchanged = source_path.exists() and source_path.read_text(encoding="utf-8").strip() == block.strip()
            source_path.write_text(block + "\n", encoding="utf-8")
            for extension in ("svg", "png"):
                if unchanged and (RENDERED / f"{name}.{extension}").exists() and not os.environ.get("MERMAID_FORCE_RENDER"):
                    continue
                subprocess.run(["node", str(cli), "-i", str(source_path), "-o",
                                str(RENDERED / f"{name}.{extension}"), "-c", str(config_path),
                                "-p", str(puppet), "-b", "white", "--size", "2400", "-s", "2"],
                               check=True, cwd=ROOT)
            print(f"Rendered {name}", flush=True)


if __name__ == "__main__":
    main()
