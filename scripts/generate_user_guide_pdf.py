from pathlib import Path
import textwrap

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'docs' / 'user-guide.md'
outfile = ROOT / 'docs' / 'user-guide.pdf'

raw_lines = source.read_text(encoding='utf-8').splitlines()
processed = []
for line in raw_lines:
    line = line.rstrip()
    if not line:
        processed.append(('', 12))
        continue

    if line.startswith('# '):
        processed.append((line[2:].upper(), 18))
        processed.append(('', 8))
        continue
    if line.startswith('## '):
        processed.append((line[3:], 15))
        continue
    if line.startswith('### '):
        processed.append((line[4:], 13))
        continue

    bullet_prefix = ''
    if line.startswith('- '):
        bullet_prefix = '- '
        line = line[2:]
    elif line[:2].isdigit() and line[2:4] == '. ':
        bullet_prefix = line[:4]
        line = line[4:]

    width = 82 if bullet_prefix else 88
    wrapped = textwrap.wrap(line, width=width) or ['']
    for i, chunk in enumerate(wrapped):
        prefix = bullet_prefix if i == 0 else '  '
        processed.append((prefix + chunk, 11))


def pdf_escape(text: str) -> str:
    return text.replace('\\', r'\\').replace('(', r'\(').replace(')', r'\)')


def build_pages(lines):
    pages = []
    current = []
    y = 780
    for text, size in lines:
        step = size + 5
        if y < 60:
            pages.append(current)
            current = []
            y = 780
        current.append((text, size))
        y -= step
    if current:
        pages.append(current)
    return pages


pages = build_pages(processed)
objects = []


def add_object(content: str) -> int:
    objects.append(content)
    return len(objects)


font_obj = add_object('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
page_ids = []
content_ids = []
pages_obj_index = 2 + len(pages) * 2

for page_lines in pages:
    stream_lines = ['BT', '/F1 11 Tf', '50 790 Td']
    first = True
    for text, size in page_lines:
        if first:
            stream_lines.append(f'/{"F1"} {size} Tf')
            stream_lines.append(f'({pdf_escape(text)}) Tj')
            first = False
        else:
            stream_lines.append(f'{size + 5} TL')
            stream_lines.append('T*')
            stream_lines.append(f'/{"F1"} {size} Tf')
            stream_lines.append(f'({pdf_escape(text)}) Tj')
    stream_lines.append('ET')
    stream = '\n'.join(stream_lines)
    content_obj = add_object(f'<< /Length {len(stream.encode("utf-8"))} >>\nstream\n{stream}\nendstream')
    content_ids.append(content_obj)
    page_obj = add_object(f'<< /Type /Page /Parent {pages_obj_index} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 {font_obj} 0 R >> >> /Contents {content_obj} 0 R >>')
    page_ids.append(page_obj)

pages_kids = ' '.join(f'{pid} 0 R' for pid in page_ids)
pages_obj = add_object(f'<< /Type /Pages /Kids [{pages_kids}] /Count {len(page_ids)} >>')
catalog_obj = add_object(f'<< /Type /Catalog /Pages {pages_obj} 0 R >>')

pdf = ['%PDF-1.4\n']
offsets = [0]
for i, obj in enumerate(objects, start=1):
    offsets.append(sum(len(part.encode('utf-8')) for part in pdf))
    pdf.append(f'{i} 0 obj\n{obj}\nendobj\n')

xref_start = sum(len(part.encode('utf-8')) for part in pdf)
pdf.append(f'xref\n0 {len(objects) + 1}\n')
pdf.append('0000000000 65535 f \n')
for off in offsets[1:]:
    pdf.append(f'{off:010d} 00000 n \n')
pdf.append(f'trailer\n<< /Size {len(objects) + 1} /Root {catalog_obj} 0 R >>\n')
pdf.append(f'startxref\n{xref_start}\n%%EOF')

outfile.write_bytes(''.join(pdf).encode('utf-8'))
print(f'Created {outfile}')
