import json
from pathlib import Path
from pypdf import PdfReader
from linkforge_render.pdf import build_pdf
from linkforge_render.html import build_html

def sample():
 return {"source":{"title":"Verified Source","normalized_source":"file.txt","canonical_url":None,"retrieved_at":"2026-08-04T00:00:00Z"},"summary":{"executive_summary":"A grounded summary.","key_points":["One","Two"],"actions":["Verify"],"risks":["May change"],"method":"test"},"provenance":{"content_sha256":"a"*64}}

def test_render(tmp_path:Path):
 build_pdf(sample(),tmp_path/"report.pdf"); build_html(sample(),tmp_path/"report.html")
 assert len(PdfReader(str(tmp_path/"report.pdf")).pages)>=1
 assert "MiseOS LinkForge" in (tmp_path/"report.html").read_text()
