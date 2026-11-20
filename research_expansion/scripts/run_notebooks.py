#!/usr/bin/env python3
"""Execute research notebooks against observed real-data inputs; record failures honestly."""
from pathlib import Path
import argparse,json,sys
import nbformat
from nbclient import NotebookClient

HERE=Path(__file__).resolve().parents[1]
NOTEBOOKS=HERE/'notebooks'
p=argparse.ArgumentParser()
p.add_argument('--start',type=int,default=0)
p.add_argument('--end',type=int,default=12)
args=p.parse_args()

def find_repo(path):
 for d in [path,*path.parents]:
  if (d/'data'/'processed'/'panel_monthly.csv').exists():return d
 raise SystemExit('No observed data/processed/panel_monthly.csv found in pack parent directories. Run ingestion first.')
repo=find_repo(HERE)
out=repo/'reports'/'research'/'notebook_runs'
out.mkdir(parents=True,exist_ok=True)
statuses=[]
for nb_file in sorted(NOTEBOOKS.glob('*.ipynb')):
 idx=int(nb_file.name[:2])
 if not args.start<=idx<=args.end:continue
 nb=nbformat.read(nb_file,as_version=4)
 try:
  result=NotebookClient(nb,timeout=180,kernel_name='python3',resources={'metadata':{'path':str(NOTEBOOKS)}}).execute()
  nbformat.write(result,out/nb_file.name)
  status={'notebook':nb_file.name,'status':'executed','executed_notebook':str((out/nb_file.name).relative_to(repo).as_posix())}
 except Exception as e:
  status={'notebook':nb_file.name,'status':'error','reason':f'{type(e).__name__}: {str(e).strip().splitlines()[-1][:350]}'}
 statuses.append(status);print(status)
(out/'statuses.json').write_text(json.dumps(statuses,indent=2),encoding='utf-8')
if any(x['status']=='error' for x in statuses):sys.exit(1)
