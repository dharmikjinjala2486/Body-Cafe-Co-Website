"""Fixture-only identities for historical regression tests. Never exposed by the server."""
def fixture_identity(store,s,data):
    uid=data['identity'];role='viewer' if uid=='viewer' else 'admin'
    with store.db() as c:
        c.execute('INSERT OR REPLACE INTO users VALUES(?,?,?,?)',(uid,uid,'',role))
        c.execute('UPDATE sessions SET user_id=? WHERE id=?',(uid,s['id']))
