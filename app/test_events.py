"""Page events (28 Nov 2026): analytics events with a page and a short detail, counted for the admin."""
import tempfile
import time
import unittest
from pathlib import Path

from app.server import Store, Error


class EventTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.store = Store(Path(self.tmp.name) / 'test.db')
        self.guest = self.store.session('')[0]
        self.admin = {'role': 'admin', 'user_id': 'store-owner', 'name': 'Store admin'}

    def tearDown(self): self.tmp.cleanup()

    def send(self, name, page='/omega3-fishoil', detail=''):
        return self.store.event(self.guest, {'name': name, 'page': page, 'detail': detail})

    def test_events_are_counted_by_name_page_and_detail_for_the_admin(self):
        self.send('pdp_view'); self.send('pdp_view', page='/omega3-fishoil?design=e&part=5')
        self.send('pdp_section', detail='Description: Why this amount?'); self.send('pdp_pack', detail='2 bottles')
        self.send('pdp_pack', detail='2 bottles'); self.store.event(self.guest, {'name': 'cart_add'})
        got = {(r['name'], r['page'], r['detail']): r['count'] for r in self.store.snapshot(self.admin)['events']}
        self.assertEqual(got[('pdp_view', '/omega3-fishoil', None)], 2)  # the query is dropped
        self.assertEqual(got[('pdp_pack', '/omega3-fishoil', '2 bottles')], 2)
        self.assertEqual(got[('pdp_section', '/omega3-fishoil', 'Description: Why this amount?')], 1)
        self.assertEqual(got[('cart_add', None, None)], 1)
        self.assertNotIn('events', self.store.snapshot(self.guest))

    def test_only_known_names_a_page_on_this_site_and_a_short_plain_detail_are_kept(self):
        for bad in ({'name': 'pdp_unknown'}, {'name': 'pdp_view', 'page': '//evil.example'}, {'name': 'pdp_view', 'page': 'https://x.test/'},
                    {'name': 'pdp_section', 'detail': '<script>'}, {'name': 'pdp_section', 'detail': 'x' * 61}):
            with self.assertRaises(Error): self.store.event(self.guest, bad)
        self.assertEqual(self.store.snapshot(self.admin)['events'], [])

    def test_a_visitor_can_send_at_most_300_events_an_hour_and_old_events_drop_out_of_the_count(self):
        with self.store.db() as c:
            c.executemany('INSERT INTO events(user_id,name,created,page,detail,session) VALUES(?,?,?,?,?,?)',
                          [(None, 'pdp_scroll', int(time.time()), '/omega3-fishoil', '25%', self.guest['id'])] * 300)
            c.execute('INSERT INTO events(user_id,name,created,page,detail,session) VALUES(?,?,?,?,?,?)',
                      (None, 'pdp_view', int(time.time()) - 31 * 86400, '/omega3-fishoil', None, 'old'))
        with self.assertRaises(Error) as e: self.send('pdp_view')
        self.assertEqual(e.exception.status, 429)
        names = {r['name'] for r in self.store.snapshot(self.admin)['events']}
        self.assertEqual(names, {'pdp_scroll'})


if __name__ == '__main__':
    unittest.main()
