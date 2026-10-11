import io
import csv
import json
from typing import List, Dict, Any


class ExportService:
    """Service generating CSV and JSON export payloads for tabular analysis."""

    def to_csv(self, columns: List[str], rows: List[Dict[str, Any]]) -> str:
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=columns)
        writer.writeheader()
        for r in rows:
            writer.writerow({col: r.get(col, "") for col in columns})
        return output.getvalue()

    def to_json(self, data: Any) -> str:
        return json.dumps(data, indent=2, default=str)


export_service = ExportService()
