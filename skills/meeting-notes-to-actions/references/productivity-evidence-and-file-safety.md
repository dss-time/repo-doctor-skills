# Evidence and File Safety

Apply this shared policy whenever a workflow reads source material, makes factual claims, or creates files.

## Evidence labels

- **Fact:** directly supported by supplied material or a cited source.
- **Quotation:** verbatim source text with location when available.
- **Inference:** reasoned interpretation, clearly labeled.
- **Recommendation:** proposed action, not an observed fact.
- **Unknown:** material evidence is missing or inaccessible.

Never invent sources, page numbers, figures, names, owners, dates, decisions, validation results, or file contents. For research, record title or publisher, publication date, event date when different, URL or identifier, and access date.

## Capability gate

Before claiming file access or validation, confirm the platform actually provides the required reader, parser, renderer, OCR, browser, search, spreadsheet, document, PDF, presentation, or execution capability. If unavailable:

1. state exactly which operation was not performed;
2. work only from accessible text or metadata;
3. provide a manual or tool-enabled next step;
4. lower confidence for affected conclusions.

Do not equate text extraction with visual inspection, OCR output with ground truth, or a generated file with a successfully rendered file.

## Source preservation

- Treat source files and source data as read-only by default.
- Write transformations to a new, explicit output path unless overwrite is expressly authorized.
- Preserve headings, links, tables, formulas, encodings, identifiers, and provenance when they are in scope.
- Validate the new artifact independently when the platform supports it; otherwise report the unverified checks.

## Consistency

Normalize only for comparison. Preserve the original value in the evidence record. Compare numbers together with units, dates together with calendar/timezone and reporting period, and statements together with version or effective date.
