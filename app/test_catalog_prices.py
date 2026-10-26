"""Price-sheet seeding and one-time updates to an existing preview catalogue."""
import json
from pathlib import Path
import tempfile
import unittest
from app.server import Store

EXPECTED = {'iron-bisglycinate': 899, 'l-theanine': 1699, 'vitamin-d3-k2': 1049,
            'omega-3-fish-oil': 1949, 'myo-d-chiro-inositol': 1499,
            'creatine-chews': 749, 'psyllium-husk': 949}

class CatalogPricesTest(unittest.TestCase):
    def test_uploaded_prices_are_seeded(self):
        with tempfile.TemporaryDirectory() as tmp:
            store = Store(Path(tmp) / 'preview.sqlite3')
            self.assertEqual({p['id']: p['price'] for p in store.products()}, EXPECTED)

    def test_existing_catalogue_is_updated_once_without_replacing_other_fields(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'preview.sqlite3'
            store = Store(path)
            with store.db() as c:
                c.execute('DELETE FROM settings WHERE id=?', ('price-sheet-2026-10-24',))
                row = json.loads(c.execute("SELECT data FROM products WHERE id='l-theanine'").fetchone()['data'])
                row.update(price=899, subtitle='Preserved editorial copy')
                c.execute("UPDATE products SET data=? WHERE id='l-theanine'", (json.dumps(row),))
            store = Store(path)
            p = next(p for p in store.products() if p['id'] == 'l-theanine')
            self.assertEqual(p['price'], 1699)
            self.assertEqual(p['subtitle'], 'Preserved editorial copy')
            with store.db() as c:
                row = json.loads(c.execute("SELECT data FROM products WHERE id='l-theanine'").fetchone()['data'])
                row['price'] = 1700
                c.execute("UPDATE products SET data=? WHERE id='l-theanine'", (json.dumps(row),))
            self.assertEqual(next(p for p in Store(path).products() if p['id'] == 'l-theanine')['price'], 1700)
