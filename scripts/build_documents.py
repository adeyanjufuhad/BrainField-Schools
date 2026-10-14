"""Build printable PDFs from the project's Markdown and Mermaid renders."""
from pathlib import Path
from html import escape
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak,
                               Table, TableStyle, Image, KeepTogether)
from reportlab.platypus.tableofcontents import TableOfContents

ROOT = Path(__file__).resolve().parents[1]
NAVY = colors.HexColor("#386641")
BLUE = colors.HexColor("#386641")
PALE = colors.HexColor("#f3f6ee")
INK = colors.HexColor("#386641")
WIDTH, HEIGHT = A4
CONTENT_WIDTH = WIDTH - 100


def register_fonts():
    candidates = [
        (Path("C:/Windows/Fonts"), ("arial.ttf", "arialbd.ttf", "ariali.ttf", "consola.ttf")),
        (Path("/usr/share/fonts/truetype/dejavu"),
         ("DejaVuSans.ttf", "DejaVuSans-Bold.ttf", "DejaVuSans-Oblique.ttf", "DejaVuSansMono.ttf")),
    ]
    for directory, filenames in candidates:
        if all((directory / name).exists() for name in filenames):
            for face, filename in zip(("School", "School-Bold", "School-Italic", "School-Mono"), filenames):
                pdfmetrics.registerFont(TTFont(face, str(directory / filename)))
            pdfmetrics.registerFontFamily("School", normal="School", bold="School-Bold", italic="School-Italic")
            return "School", "School-Bold", "School-Mono"
    return "Helvetica", "Helvetica-Bold", "Courier"


FONT, BOLD, MONO = register_fonts()
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="BodySchool", fontName=FONT, fontSize=9.2, leading=14,
                          textColor=INK, spaceAfter=7, splitLongWords=True))
styles.add(ParagraphStyle(name="TitleSchool", fontName=BOLD, fontSize=31, leading=37,
                          textColor=NAVY, spaceAfter=16))
styles.add(ParagraphStyle(name="SectionSchool", fontName=BOLD, fontSize=16, leading=21,
                          textColor=NAVY, spaceBefore=16, spaceAfter=9, keepWithNext=True))
styles.add(ParagraphStyle(name="SubSchool", fontName=BOLD, fontSize=11, leading=16,
                          textColor=BLUE, spaceBefore=10, spaceAfter=6, keepWithNext=True))
styles.add(ParagraphStyle(name="CellSchool", parent=styles["BodySchool"], fontSize=8,
                          leading=11, spaceAfter=0))
styles.add(ParagraphStyle(name="CodeSchool", fontName=MONO, fontSize=7.1, leading=10,
                          textColor=INK, leftIndent=7, rightIndent=7, spaceAfter=3))
styles.add(ParagraphStyle(name="CaptionSchool", fontName=FONT, fontSize=8, leading=12,
                          textColor=BLUE, spaceAfter=9))


def inline(text):
    text = escape(text)
    text = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<link href="\2" color="#386641">\1</link>', text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1 (\2)", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`([^`]+)`", r'<font name="' + MONO + r'">\1</font>', text)
    return text


class Document(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == "SectionSchool":
            label = flowable.getPlainText()
            key = "section-" + re.sub(r"\W+", "-", label)
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(label, key, 0)
            self.notify("TOCEntry", (0, label, self.page, key))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#dce4d7"))
    canvas.line(50, 43, WIDTH - 50, 43)
    canvas.setFont(FONT, 8)
    canvas.setFillColor(INK)
    canvas.drawString(50, 29, "BrainField Schools  |  Proposed design  |  14 October 2026")
    canvas.drawRightString(WIDTH - 50, 29, str(doc.page))
    canvas.restoreState()


def table(rows):
    count = len(rows[0])
    widths = ([CONTENT_WIDTH * 0.25, CONTENT_WIDTH * 0.75] if count == 2 else
              [CONTENT_WIDTH / count] * count)
    cells = [[Paragraph(inline(cell), styles["CellSchool"]) for cell in row] for row in rows]
    result = Table(cells, colWidths=widths, repeatRows=1, hAlign="LEFT")
    result.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PALE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f9f3")]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, BLUE),
        ("LINEBELOW", (0, 1), (-1, -1), 0.25, colors.HexColor("#dce4d7")),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return result


def build(source_name, output_name, subtitle):
    source = (ROOT / "docs" / source_name).read_text(encoding="utf-8")
    lines = source.splitlines()
    story = [Spacer(1, 70), Paragraph("BRAINFIELD SCHOOLS", styles["SubSchool"]),
             Spacer(1, 15), Paragraph(subtitle, styles["TitleSchool"]),
             Paragraph("A practical blueprint for a Nigerian secondary school", styles["BodySchool"]),
             Spacer(1, 24), table([
                 ["Edition", "Version 1.1 — 14 October 2026"],
                 ["Status", "Landing page implemented. Neon integration prepared; school portals remain planned."],
                 ["Core workflow", "Subject teacher → Class teacher → VP Administration → Publication"],
                 ["Leadership", "Separate director dashboard for results and statistics"],
                 ["Scope decision", "Learning progress reports excluded"],
             ]), Spacer(1, 22),
             Paragraph("Prepared for the founders and school leadership. Review open policy decisions before implementation.",
                       styles["BodySchool"]), PageBreak(),
             Paragraph("Contents", styles["TitleSchool"])]
    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle(name="TOCSchool", fontName=FONT, fontSize=9,
                                     leading=15, spaceAfter=4, textColor=INK)]
    story.extend([toc, PageBreak()])
    index = 0
    diagram_index = 0
    while index < len(lines):
        line = lines[index]
        if index == 0 and line.startswith("# "):
            index += 1
            continue
        if not line.strip():
            index += 1
            continue
        if line.startswith("```mermaid"):
            diagram_index += 1
            while index + 1 < len(lines) and not lines[index + 1].startswith("```"):
                index += 1
            index += 2
            png = ROOT / "docs" / "diagrams" / "rendered" / f"architecture-{diagram_index:02d}.png"
            if not png.exists():
                raise RuntimeError(f"Missing Mermaid render: {png}")
            image = Image(str(png))
            scale = min(CONTENT_WIDTH / image.imageWidth, 590 / image.imageHeight)
            image.drawWidth = image.imageWidth * scale
            image.drawHeight = image.imageHeight * scale
            caption = Paragraph(f"Figure {diagram_index}. Rendered directly from the architecture's Mermaid source.", styles["CaptionSchool"])
            story.append(KeepTogether([caption, image, Spacer(1, 12)]))
            continue
        if line.startswith("```"):
            index += 1
            code = []
            while index < len(lines) and not lines[index].startswith("```"):
                raw = lines[index]
                # Wrap long commands while retaining all text in the printable edition.
                while len(raw) > 103:
                    code.append(raw[:103])
                    raw = "    " + raw[103:]
                code.append(raw)
                index += 1
            for raw in code:
                story.append(Paragraph(escape(raw).replace(" ", "&#160;"), styles["CodeSchool"]))
            story.append(Spacer(1, 8))
            index += 1
            continue
        if line.startswith("| "):
            rows = []
            while index < len(lines) and lines[index].startswith("|"):
                row = [part.strip() for part in lines[index].strip().strip("|").split("|")]
                if not all(re.fullmatch(r"[:\- ]+", part) for part in row):
                    rows.append(row)
                index += 1
            story.extend([table(rows), Spacer(1, 10)])
            continue
        if line.startswith("## "):
            story.append(Paragraph(inline(line[3:]), styles["SectionSchool"]))
            index += 1
            continue
        if line.startswith("### "):
            story.append(Paragraph(inline(line[4:]), styles["SubSchool"]))
            index += 1
            continue
        bullet = re.match(r"^(- |\d+\. )(.*)", line)
        if bullet:
            marker = "•" if bullet.group(1) == "- " else bullet.group(1).strip()
            paragraph = Paragraph(inline(bullet.group(2)), styles["BodySchool"], bulletText=marker)
            paragraph.style = ParagraphStyle(name="ListSchool", parent=styles["BodySchool"], leftIndent=14, bulletIndent=0)
            story.append(paragraph)
            index += 1
            continue
        paragraph_lines = [line.lstrip("> ")]
        index += 1
        while index < len(lines) and lines[index].strip() and not re.match(r"^(#|\||```|- |\d+\. )", lines[index]):
            paragraph_lines.append(lines[index])
            index += 1
        story.append(Paragraph(inline(" ".join(paragraph_lines)), styles["BodySchool"]))
    output = ROOT / "docs" / output_name
    document = Document(str(output), pagesize=A4, leftMargin=50, rightMargin=50,
                        topMargin=48, bottomMargin=58, title=f"BrainField Schools — {subtitle}",
                        author="BrainField Schools project founders", pageCompression=1)
    document.multiBuild(story, onFirstPage=footer, onLaterPages=footer)
    print(f"Built {output.name}")


if __name__ == "__main__":
    build("SYSTEM-ARCHITECTURE.md", "BrainField-Schools-System-Architecture.pdf", "System Architecture")
    build("BUILD-GUIDE.md", "BrainField-Schools-Build-Guide.pdf", "Practical Build Guide")
