"""Tester feedback: notes left from the storefront's Feedback button."""
import tempfile
import unittest
from pathlib import Path

from app.server import Store, Error


class TesterFeedbackTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.store = Store(Path(self.tmp.name) / 'test.db')
        self.guest = self.store.session('')[0]
        self.admin = {'role': 'admin', 'user_id': 'store-owner', 'name': 'Store admin'}

    def tearDown(self): self.tmp.cleanup()

    def note(self, **over):
        return self.store.tester_note(self.guest, {'note': 'The pack cards are clear.', 'name': 'Asha', 'page': '/omega3-fishoil?design=e', 'page_name': 'Omega-3 Fish Oil', 'section': 'Frequently bought with', 'design': 'Part 2', 'screen': '375×812', **over})

    def test_a_note_is_saved_with_its_page_and_shown_to_the_admin(self):
        self.assertEqual(self.note(), {'ok': True})
        notes = self.store.snapshot(self.admin)['tester_notes']
        self.assertEqual(len(notes), 1)
        self.assertEqual((notes[0]['note'], notes[0]['name'], notes[0]['page'], notes[0]['design'], notes[0]['screen']),
                         ('The pack cards are clear.', 'Asha', '/omega3-fishoil?design=e', 'Part 2', '375×812'))
        self.assertEqual((notes[0]['page_name'], notes[0]['section']), ('Omega-3 Fish Oil', 'Frequently bought with'))
        self.assertNotIn('tester_notes', self.store.snapshot(self.guest))

    def test_testers_read_the_notes_left_on_the_same_page_and_only_that_page(self):
        self.note(); self.note(page='/omega3-fishoil', note='Same page, no query', name=''); self.note(page='/shop', note='Another page')
        got = self.store.tester_notes('/omega3-fishoil?design=e&part=5')['notes']
        self.assertEqual(sorted(n['note'] for n in got), ['Same page, no query', 'The pack cards are clear.'])
        self.assertEqual(set(got[0]), {'id', 'note', 'name', 'section', 'page', 'page_name', 'status', 'design', 'pin', 'created'})
        self.assertEqual((got[0]['design'], got[0]['pin']), ('Part 2', None))
        self.assertEqual(self.store.tester_notes('/')['notes'], [])
        self.assertEqual(len(self.store.tester_notes()['notes']), 3)
        for bad in ('//evil.example', 'https://evil.example'):
            with self.assertRaises(Error): self.store.tester_notes(bad)

    def test_a_note_starts_open_and_can_be_moved_to_in_progress_or_resolved(self):
        self.note(); n = self.store.tester_notes()['notes'][0]
        self.assertEqual(n['status'], 'open')
        self.assertEqual(self.store.tester_status({'id': n['id'], 'status': 'in_progress'})['status'], 'in_progress')
        self.store.tester_status({'id': n['id'], 'status': 'resolved'})
        self.assertEqual(self.store.tester_notes()['notes'][0]['status'], 'resolved')
        self.assertEqual(self.store.snapshot(self.admin)['tester_notes'][0]['status'], 'resolved')
        self.assertEqual(self.store.tester_notes()['notes'][0]['note'], 'The pack cards are clear.')
        for bad in ({'id': n['id'], 'status': 'done'}, {'id': 'nope', 'status': 'open'}, {'id': '0' * 16, 'status': 'open'}):
            with self.assertRaises(Error): self.store.tester_status(bad)

    def test_a_comment_can_be_pinned_to_a_spot_on_the_page(self):
        pin = {'sel': '#main > section:nth-of-type(2) > h2:nth-of-type(1)', 'x': 0.25, 'y': 0.5, 'text': 'Pick your <b>pack', 'hl': 1, 'extra': 'dropped'}
        self.note(pin=pin); self.note(pin={'sel': '', 'x': 0, 'y': 1, 'text': 'Found by its words only'})
        got = {bool(n['pin']['sel']): n for n in self.store.tester_notes()['notes']}; words, placed = got[False], got[True]
        self.assertEqual(placed['pin'], {'sel': pin['sel'], 'x': 0.25, 'y': 0.5, 'text': 'Pick your  b pack', 'hl': True})
        self.assertEqual(words['pin'], {'sel': '', 'x': 0.0, 'y': 1.0, 'text': 'Found by its words only', 'hl': False})
        self.assertIn('Pick your  b pack', [n['pin']['text'] for n in self.store.snapshot(self.admin)['tester_notes']])
        self.store.tester_status({'id': placed['id'], 'status': 'resolved'})
        self.assertEqual([n['pin'] for n in self.store.tester_notes()['notes'] if n['id'] == placed['id']], [placed['pin']])
        for bad in ('top left', [], {'sel': 'h2', 'x': 2, 'y': 0}, {'sel': 'h2', 'x': '0.5', 'y': 0}, {'sel': 'h2', 'x': True, 'y': 0}, {'sel': 'h2', 'y': 0}, {'sel': 'a[href="x"]', 'x': 0, 'y': 0},
                    {'sel': 'h2,script', 'x': 0, 'y': 0}, {'sel': 'h' * 401, 'x': 0, 'y': 0}, {'sel': 'h2', 'x': 0, 'y': 0, 'text': 't' * 201}, {'sel': '', 'x': 0, 'y': 0, 'text': ''}, {'sel': 'h2', 'x': float('nan'), 'y': 0}):
            with self.assertRaises(Error): self.note(pin=bad)
        self.assertEqual(len(self.store.tester_notes()['notes']), 2)

    def test_bad_input_and_off_site_pages_are_refused(self):
        for bad in ({'note': 'ok'}, {'note': 'x' * 2001}, {'page': '//evil.example/x'}, {'page': 'https://evil.example'}, {'name': 'n' * 61}, {'screen': '<b>'}, {'design': '<i>'}, {'section': 's' * 81}):
            with self.assertRaises(Error): self.note(**bad)
        self.assertEqual(self.store.snapshot(self.admin)['tester_notes'], [])

    def test_one_visitor_is_limited_to_thirty_notes_an_hour(self):
        for _ in range(30): self.note()
        with self.assertRaises(Error) as e: self.note()
        self.assertEqual(e.exception.status, 429)
        self.assertEqual(self.store.tester_note(self.store.session('')[0], {'note': 'Another visitor', 'page': '/'}), {'ok': True})


if __name__ == '__main__':
    unittest.main()
