import fitz

def extract_pdf_text(filepath):

    try:

        with fitz.open(filepath) as document:

            pages = []

            for page in document:
                pages.append(page.get_text())

            return "\n".join(pages).strip
    except Exception as e:
        raise RuntimeError(f"Could not read PDF: {e}")
