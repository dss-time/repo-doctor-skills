# PDF Capability Matrix

| Capability | Supported claim | Unsupported claim |
|---|---|---|
| Metadata only | File size, declared page count when exposed | Page content or layout quality |
| Text extraction | Extracted words and order within tool limits | Visual placement or image content |
| Page mapping | Findings tied to returned page indices | Printed labels without verification |
| Table extraction | Parsed cells with extraction caveats | Faithful visual alignment |
| Rendering | Visible clipping, overlap, font, spacing, and page composition | OCR accuracy by itself |
| OCR | Tentative text from scanned pages | Ground-truth wording or figures without verification |

Record whether page indices are zero- or one-based and convert only when the tool contract is clear.
