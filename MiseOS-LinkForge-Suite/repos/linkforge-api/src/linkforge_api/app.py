from __future__ import annotations
import json,os,secrets,sqlite3,subprocess,threading,uuid
from datetime import datetime,timezone
from pathlib import Path
from fastapi import Depends,FastAPI,Header,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel,Field

DATA=Path(os.getenv("LINKFORGE_DATA_DIR","data")).resolve(); DATA.mkdir(parents=True,exist_ok=True); DB=DATA/"jobs.sqlite3"
ALLOWED={"source.txt","report.md","report.json","report.yaml","report.txt","manifest.json","manifest.yaml","sha256sums.txt","report.pdf","report.html","evidence.json"}

def connect():
 c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; c.execute("CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, source TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, error TEXT, result_json TEXT)"); return c

def auth(authorization:str|None=Header(default=None)):
 expected=os.getenv("LINKFORGE_API_KEY")
 if not expected: raise HTTPException(503,"LINKFORGE_API_KEY is not configured")
 if not authorization or not authorization.startswith("Bearer ") or not secrets.compare_digest(authorization[7:],expected): raise HTTPException(401,"Unauthorized")

class CaptureRequest(BaseModel):
 source:str=Field(min_length=1,max_length=4096)
 provider:str=Field(default="auto",pattern="^(auto|openai|extractive)$")

app=FastAPI(title="MiseOS LinkForge API",version="1.0.0")
origins=[x.strip() for x in os.getenv("CORS_ORIGINS","http://localhost:8080").split(",") if x.strip()]
app.add_middleware(CORSMiddleware,allow_origins=origins,allow_credentials=False,allow_methods=["GET","POST"],allow_headers=["Authorization","Content-Type"])

@app.get("/health")
def health(): return {"ok":True,"service":"linkforge-api","version":"1.0.0"}

@app.post("/v1/captures",status_code=202,dependencies=[Depends(auth)])
def create_capture(request:CaptureRequest):
 job_id=str(uuid.uuid4()); now=datetime.now(timezone.utc).isoformat()
 with connect() as c: c.execute("INSERT INTO jobs VALUES (?,?,?,?,?,?,?)",(job_id,request.source,"queued",now,now,None,None))
 threading.Thread(target=run_job,args=(job_id,request),daemon=True).start()
 return {"id":job_id,"status":"queued"}

def run_job(job_id:str,request:CaptureRequest):
 now=lambda:datetime.now(timezone.utc).isoformat(); output=DATA/"packets"/job_id; output.mkdir(parents=True,exist_ok=True)
 with connect() as c: c.execute("UPDATE jobs SET status='running',updated_at=? WHERE id=?",(now(),job_id))
 try:
  command=[os.getenv("LINKFORGE_CLI","linkforge"),"capture",request.source,"--output",str(output),"--provider",request.provider]
  proc=subprocess.run(command,capture_output=True,text=True,timeout=int(os.getenv("LINKFORGE_JOB_TIMEOUT","180")),check=True)
  result=json.loads(proc.stdout); status="complete"; error=None
 except Exception as exc:
  result={}; status="failed"; error=str(exc)[-2000:]
 with connect() as c: c.execute("UPDATE jobs SET status=?,updated_at=?,error=?,result_json=? WHERE id=?",(status,now(),error,json.dumps(result),job_id))

@app.get("/v1/captures/{job_id}",dependencies=[Depends(auth)])
def get_capture(job_id:str):
 with connect() as c: row=c.execute("SELECT * FROM jobs WHERE id=?",(job_id,)).fetchone()
 if not row: raise HTTPException(404,"Capture not found")
 return {**dict(row),"result":json.loads(row["result_json"] or "{}"),"artifacts":sorted(p.name for p in (DATA/"packets"/job_id).glob("*") if p.name in ALLOWED)}

@app.get("/v1/captures/{job_id}/artifacts/{name}",dependencies=[Depends(auth)])
def artifact(job_id:str,name:str):
 if name not in ALLOWED: raise HTTPException(404,"Unknown artifact")
 path=(DATA/"packets"/job_id/name).resolve(); expected=(DATA/"packets"/job_id).resolve()
 if path.parent!=expected or not path.is_file(): raise HTTPException(404,"Artifact not found")
 return FileResponse(path)
