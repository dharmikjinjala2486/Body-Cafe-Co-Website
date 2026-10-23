"""Publish a clearly labelled QA fixture report through the real two-Admin workflow on a LOCAL TEST server.
Never run against a database holding real records. Usage: fixture.py BASE [product] [lot]"""
import json, sys, http.cookiejar, urllib.request

BASE = sys.argv[1].rstrip("/")
PRODUCT = sys.argv[2] if len(sys.argv) > 2 else "iron-bisglycinate"
LOT = sys.argv[3] if len(sys.argv) > 3 else "DEMO-01-02"
PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\n% QA fixture document. Not a laboratory report.\ntrailer<<>>\n%%EOF\n"
RECORD = {
    "formulation_version": "QA fixture formulation v1", "manufactured": "2026-05", "expiry": "2028-04",
    "lab_report_no": "QA-FIXTURE-001", "lab_sample_ref": "QA-SAMPLE-01",
    "sample": {"type": "finished_product", "description": "QA fixture: finished capsules"},
    "dates": {"sampled": "2026-06-01", "tested_from": "2026-06-03", "tested_to": "2026-06-09", "issued": "2026-06-12"},
    "lab": {"name": "QA Fixture Laboratory (test data)", "address": "Test data only",
            "accreditation": {"body": "QA Accreditation Body (test data)", "certificate": "QA-CERT-1", "scope": "QA fixture scope: elemental impurities only", "valid_from": "2025-01-01", "valid_to": "2027-12-31", "covers": "some", "verify_url": "https://example.org/verify"}},
    "commissioned_by": "QA fixture", "summary": "QA fixture summary: shows how a reviewed plain-language summary reads.",
    "lab_notes": "QA fixture laboratory note.",
    "results": [
        {"group": "Elemental impurities", "parameter": "Lead (Pb)", "result": "<0.05", "unit": "mg/kg", "spec": "≤ 1.0 mg/kg", "spec_source": "QA fixture spec v1", "method": "QA method A", "assessment": "meets", "ref": "p. 2"},
        {"group": "Elemental impurities", "parameter": "Cadmium (Cd)", "result": "ND (LOD 0.01)", "unit": "mg/kg", "spec": "≤ 0.3 mg/kg", "spec_source": "QA fixture spec v1", "method": "QA method A", "assessment": "meets", "ref": "p. 2"},
        {"group": "Description", "parameter": "Appearance", "result": "Conforms", "assessment": "not_assessed", "ref": "p. 1"},
        {"group": "Assay", "parameter": "QA assay", "result": "95.1–98.0", "unit": "%", "note": "Range as reported", "assessment": "not_assessed", "ref": "p. 3"},
    ],
}


class Client:
    def __init__(self):
        self.jar = http.cookiejar.CookieJar()
        self.op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar))
        self.csrf = ""
        self.csrf = self.get("/api/session")["csrf"]

    def req(self, method, path, body=None, ctype="application/json"):
        data = json.dumps(body).encode() if body is not None and ctype == "application/json" else body
        r = urllib.request.Request(BASE + path, data=data, method=method, headers={"Content-Type": ctype, "X-CSRF-Token": self.csrf})
        try:
            with self.op.open(r) as res:
                return json.loads(res.read())
        except urllib.error.HTTPError as e:
            raise SystemExit(f"{method} {path}: {e.code} {e.read()[:200]}")

    def get(self, path):
        return self.req("GET", path)

    def login(self, who):
        self.req("POST", "/api/demo/login", {"identity": who})
        self.csrf = self.get("/api/session")["csrf"]


if __name__ == '__main__':
    a, b = Client(), Client()
    a.login("admin-a"); b.login("admin-b")
    d = a.req("POST", "/api/admin/lot_draft", {"product": PRODUCT, "lot": LOT})
    a.req("POST", "/api/admin/lot_update", {"id": d["id"], "record": RECORD})
    a.req("POST", f"/api/admin-lot-document?report={d['id']}&title=QA%20fixture%20certificate&kind=original", PDF, "application/pdf")
    apr = a.req("POST", "/api/admin/lot_submit", {"id": d["id"]})
    b.req("POST", "/api/admin/approve", {"id": apr["id"], "decision": "approve"})
    print(json.dumps({"report": d["id"], "approval": apr["id"], "product": PRODUCT, "lot": LOT}))
