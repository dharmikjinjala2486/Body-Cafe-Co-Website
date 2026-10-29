"""Create a consistent SQLite + uploaded-file backup while local operations are paused."""
import argparse
import json
import shutil
import sqlite3
from pathlib import Path
from datetime import datetime, timezone


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--db',default=str(Path(__file__).resolve().parent.parent/'.local/preview.sqlite3'))
    parser.add_argument('--output',required=True)
    args=parser.parse_args();source=Path(args.db).resolve();dest=Path(args.output).resolve()
    if not source.is_file():raise SystemExit('Database not found.')
    dest.mkdir(parents=True,exist_ok=False);dest.chmod(0o700)
    with sqlite3.connect('file:'+str(source)+'?mode=ro',uri=True) as db:
        with sqlite3.connect(dest/source.name) as out:db.backup(out)
    (dest/source.name).chmod(0o600)
    folders=[]
    for suffix in ['-catalog-media','-lot-documents','-review-media']:
        folder=source.parent/(source.stem+suffix)
        if folder.exists():shutil.copytree(folder,dest/folder.name);folders.append(folder.name)
    with sqlite3.connect(dest/source.name) as out:
        if out.execute('PRAGMA integrity_check').fetchone()[0]!='ok':raise SystemExit('Backup integrity check failed.')
    (dest/'manifest.json').write_text(json.dumps({'database':source.name,'folders':folders,'created':datetime.now(timezone.utc).isoformat(),'restore':'Stop the server. Copy the database and every listed folder together into the original database parent directory. Restart and verify products, images and report lookup.'},indent=2))
    print('Backup created and SQLite integrity verified:',dest)

if __name__=='__main__':main()
