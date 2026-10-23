"""Export local design-survey responses. Netlify responses are exported from Netlify Forms."""
import argparse
import csv
import json
from pathlib import Path
import sqlite3

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--db', type=Path, default=ROOT / '.local/preview.sqlite3')
parser.add_argument('--output', type=Path, default=ROOT / '.local/theme-feedback.csv')


def main():
    args = parser.parse_args()
    if not args.db.is_file():
        parser.error('The feedback database does not exist.')
    with sqlite3.connect(f'file:{args.db.resolve()}?mode=ro', uri=True) as connection:
        exists = connection.execute("SELECT name FROM sqlite_master WHERE name='theme_feedback'").fetchone()
        rows = connection.execute('SELECT id, created, data FROM theme_feedback ORDER BY created').fetchall() if exists else []
    fields = ['id', 'created', 'favourite', 'runner-up', 'fit', 'reasons', 'feelings', 'why', 'improve', 'least', 'least-why', 'reviewer-name', 'review-version']
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open('w', newline='', encoding='utf-8-sig') as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        for response_id, created, data in rows:
            row = {'id': response_id, 'created': created, **json.loads(data)}
            for key, value in row.items():
                if isinstance(value, list):
                    value = '; '.join(value)
                # Keep free text from executing as a formula when opened in a spreadsheet.
                if isinstance(value, str) and value.lstrip().startswith(('=', '+', '-', '@')):
                    value = "'" + value
                row[key] = value
            writer.writerow(row)
    print(f'Exported {len(rows)} responses to {args.output}')


if __name__ == '__main__':
    main()
