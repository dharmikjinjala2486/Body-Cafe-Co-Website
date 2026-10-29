"""Create or recover the sole local admin; passwords are read privately, never passed as arguments."""
import argparse
import getpass
import hashlib
import json
import secrets
import sys
import time
from pathlib import Path
try:
    from app.server import Store
    from app.operations import OWNER
except ImportError:
    from server import Store
    from operations import OWNER


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--db', default=str(Path(__file__).resolve().parent.parent / '.local/preview.sqlite3'))
    parser.add_argument('--username')
    parser.add_argument('--reset', action='store_true', help='Recover the local admin using access to the server filesystem.')
    parser.add_argument('--stdin-json', action='store_true', help='Read username/password from trusted stdin with terminal echo disabled.')
    args = parser.parse_args()
    if args.stdin_json:
        import termios
        fd = sys.stdin.fileno()
        previous = termios.tcgetattr(fd) if sys.stdin.isatty() else None
        if previous:
            current = termios.tcgetattr(fd); current[3] &= ~termios.ECHO; termios.tcsetattr(fd, termios.TCSANOW, current)
        try:
            print('Ready for admin setup on stdin (input is hidden).', flush=True)
            data = json.loads(sys.stdin.readline())
            username, password = data['username'], data['password']
        finally:
            if previous: termios.tcsetattr(fd, termios.TCSANOW, previous)
    else:
        username = args.username or input('Admin username: ').strip()
        password = getpass.getpass('Admin password: ')
        if password != getpass.getpass('Confirm password: '): raise SystemExit('Passwords do not match.')
    store = Store(args.db)
    if args.reset:
        if not 12 <= len(password) <= 256: raise SystemExit('Use at least 12 characters for the replacement password.')
        with store.db() as c:
            row = c.execute('SELECT username FROM admin_credential WHERE singleton=1').fetchone()
            if not row or row['username'] != username.strip().lower(): raise SystemExit('The supplied username does not match the configured admin.')
            salt = secrets.token_hex(24)
            digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1).hex()
            c.execute('UPDATE admin_credential SET salt=?,digest=?,updated=? WHERE singleton=1', (salt, digest, int(time.time())))
            c.execute('DELETE FROM sessions WHERE user_id=?', (OWNER,))
            store.operation_log(c, OWNER, 'admin_recovered_locally', OWNER)
    else:
        store.setup_admin(username, password)
    Path(args.db).chmod(0o600)
    print('Admin account configured. Open /ops to sign in.', flush=True)

if __name__ == '__main__': main()
