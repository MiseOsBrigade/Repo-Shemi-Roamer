from __future__ import annotations
import html,json
from pathlib import Path
from typing import Any
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle,getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import BaseDocTemplate,Frame,Image,KeepTogether,PageTemplate,Paragraph,PageBreak,Spacer,Table,TableStyle

FOREST=colors.HexColor("#124734"); CHARCOAL=colors.HexColor("#0F2F25"); ORANGE=colors.HexColor("#E97B22"); CREAM=colors.HexColor("#F6F1E7"); TEAL=colors.HexColor("#1E9BB8"); GOLD=colors.HexColor("#F2C94C")

def _esc(value: Any) -> str: return html.escape(str(value or ""))
def _footer(canvas,doc):
    canvas.saveState(); canvas.setStrokeColor(TEAL); canvas.line(.65*inch,.48*inch,7.85*inch,.48*inch); canvas.setFont("Helvetica",8); canvas.setFillColor(CHARCOAL); canvas.drawString(.65*inch,.3*inch,"MiseOS LinkForge · Save the source. Trace the truth. Ship the packet."); canvas.drawRightString(7.85*inch,.3*inch,f"{doc.page}"); canvas.restoreState()

def build_pdf(report: dict[str,Any], output: Path, evidence: dict[str,Any]|None=None, visuals: list[Path]|None=None) -> None:
    output.parent.mkdir(parents=True,exist_ok=True)
    doc=BaseDocTemplate(str(output),pagesize=letter,rightMargin=.65*inch,leftMargin=.65*inch,topMargin=.65*inch,bottomMargin=.65*inch,title=report["source"]["title"],author="GoodShyt Systems")
    frame=Frame(doc.leftMargin,doc.bottomMargin,doc.width,doc.height,id="main"); doc.addPageTemplates([PageTemplate(id="brand",frames=[frame],onPage=_footer)])
    base=getSampleStyleSheet(); styles={
      "title":ParagraphStyle("title",parent=base["Title"],fontName="Helvetica-Bold",fontSize=27,leading=31,textColor=FOREST,spaceAfter=16,alignment=TA_LEFT),
      "h1":ParagraphStyle("h1",parent=base["Heading1"],fontName="Helvetica-Bold",fontSize=17,leading=21,textColor=FOREST,spaceBefore=13,spaceAfter=8),
      "h2":ParagraphStyle("h2",parent=base["Heading2"],fontName="Helvetica-Bold",fontSize=12,leading=15,textColor=TEAL,spaceBefore=9,spaceAfter=5),
      "body":ParagraphStyle("body",parent=base["BodyText"],fontName="Helvetica",fontSize=9.7,leading=14,textColor=CHARCOAL,spaceAfter=7),
      "small":ParagraphStyle("small",parent=base["BodyText"],fontName="Helvetica",fontSize=7.8,leading=10,textColor=colors.HexColor("#43665B")),
      "bullet":ParagraphStyle("bullet",parent=base["BodyText"],fontName="Helvetica",fontSize=9.3,leading=13.2,textColor=CHARCOAL,leftIndent=14,firstLineIndent=-8,spaceAfter=5),
    }
    source=report["source"]; summary=report["summary"]
    story=[Paragraph("MiseOS LinkForge",styles["small"]),Paragraph(_esc(source["title"]),styles["title"])]
    meta=[["SOURCE",_esc(source.get("canonical_url") or source.get("normalized_source"))],["CAPTURED",_esc(source.get("retrieved_at"))],["METHOD",_esc(summary.get("method"))],["SHA-256",_esc(report.get("provenance",{}).get("content_sha256"))]]
    table=Table(meta,colWidths=[.9*inch,6.1*inch]); table.setStyle(TableStyle([("BACKGROUND",(0,0),(0,-1),CREAM),("TEXTCOLOR",(0,0),(0,-1),FOREST),("FONTNAME",(0,0),(0,-1),"Helvetica-Bold"),("FONTNAME",(1,0),(1,-1),"Courier"),("FONTSIZE",(0,0),(-1,-1),7.6),("VALIGN",(0,0),(-1,-1),"TOP"),("GRID",(0,0),(-1,-1),.25,colors.HexColor("#D7E3DE")),("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6)])); story += [table,Spacer(1,12)]
    story += [Paragraph("Executive summary",styles["h1"]),Paragraph(_esc(summary.get("executive_summary")),styles["body"]),Paragraph("Key points",styles["h1"])]
    story += [Paragraph("• "+_esc(x),styles["bullet"]) for x in summary.get("key_points",[])]
    story += [Paragraph("Actions",styles["h1"])] + [Paragraph("□ "+_esc(x),styles["bullet"]) for x in summary.get("actions",[])]
    story += [Paragraph("Risks and limitations",styles["h1"])] + [Paragraph("△ "+_esc(x),styles["bullet"]) for x in summary.get("risks",[])]
    if evidence:
        story += [PageBreak(),Paragraph("Evidence matrix",styles["title"]),Paragraph(f"{evidence.get('evidence_count',0)} records · average confidence {evidence.get('average_confidence',0):.3f}",styles["body"])]
        rows=[["CONF.","PROVIDER","SOURCE"]]
        for item in evidence.get("items",[])[:24]: rows.append([f"{item.get('confidence',0):.3f}",_esc(item.get("provider")),Paragraph(_esc(item.get("title")),styles["small"])])
        t=Table(rows,colWidths=[.65*inch,1.25*inch,5.1*inch],repeatRows=1); t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),FOREST),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("GRID",(0,0),(-1,-1),.25,colors.HexColor("#C9D9D2")),("VALIGN",(0,0),(-1,-1),"TOP"),("FONTSIZE",(0,0),(-1,-1),7.5),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,CREAM]),("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)])); story.append(t)
    for visual in visuals or []:
        if visual.exists():
            story += [PageBreak(),Paragraph("Source visual",styles["title"]),Image(str(visual),width=6.7*inch,height=6.7*inch,kind="proportional")]
    doc.build(story)
