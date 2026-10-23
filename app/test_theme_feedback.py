"""Survey validation and durable, retry-safe storage."""
import json
from pathlib import Path
import tempfile
import unittest

from app.server import Error, Store


class ThemeFeedbackTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.store = Store(Path(self.tmp.name) / 'feedback.sqlite3')
        self.data = {'response-id': 'test-response-12345', 'favourite': 'A', 'runner-up': 'B',
                     'least': 'G', 'fit': '4', 'why': 'The bottles and typography look connected.',
                     'reasons': ['Typography', 'Packaging fit'], 'feelings': ['Approachable'],
                     'reviewer-name': 'Test Reviewer'}

    def tearDown(self):
        self.tmp.cleanup()

    def test_durable_and_idempotent(self):
        self.assertTrue(self.store.theme_feedback(self.data)['ok'])
        self.store.theme_feedback(self.data)
        reopened = Store(self.store.path)
        with reopened.db() as c:
            rows = c.execute('SELECT * FROM theme_feedback').fetchall()
        self.assertEqual(len(rows), 1)
        self.assertEqual(json.loads(rows[0]['data'])['reasons'], ['Typography', 'Packaging fit'])

    def test_none_is_a_valid_answer(self):
        self.data.update(favourite='none', fit='na', why='None connects with our packaging yet.')
        self.assertTrue(self.store.theme_feedback(self.data)['ok'])

    def test_contradictory_choices(self):
        for changes in [{'runner-up': 'A'}, {'least': 'A'}, {'least': 'B'}]:
            with self.subTest(changes=changes), self.assertRaises(Error):
                self.store.theme_feedback({**self.data, **changes})

    def test_tampered_or_empty_answers(self):
        invalid = [{'favourite': 'Z'}, {'favourite': []}, {'runner-up': []}, {'least': []}, {'fit': []}, {'fit': '9'}, {'why': '   '}, {'why': 'x' * 1501},
                   {'reasons': ['Colours', 'Typography', 'Motion', 'Layout']},
                   {'feelings': ['Unknown']}, {'reasons': ['Colours', 'Colours']},
                   {'feelings': 'Premium'}, {'response-id': '../test'}, {'bot-field': 'bot'},
                   {'reviewer-name': ''}, {'reviewer-name': '   '}, {'reviewer-name': None}]
        for changes in invalid:
            with self.subTest(changes=changes), self.assertRaises(Error):
                self.store.theme_feedback({**self.data, **changes})


if __name__ == '__main__':
    unittest.main()
