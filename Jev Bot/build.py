"""Build a standalone, offline document search page. Python standard library only."""
from pathlib import Path
import datetime
import json
import os
import re
import stat

import sys

HERE = Path(__file__).resolve().parent

def get_source_path():
    for arg in sys.argv[1:]:
        if not arg.startswith('-'):
            return Path(arg)
    env_path = os.environ.get('JEV_DOCS_SOURCE')
    if env_path:
        return Path(env_path)
    return Path('__DOCS_DIR__')

SOURCE = get_source_path()

def linked(path):
    return bool(path.lstat().st_file_attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT) if os.name == 'nt' else path.is_symlink()

def collect(source=None):
    src = Path(source) if source else SOURCE
    if not src.exists():
        raise RuntimeError(f'Source path not found: {src}. Set JEV_DOCS_SOURCE or pass path as an argument.')
    # Do not follow junctions/symlinks, or read anything outside the fixed source.
    for ancestor in [src, *src.parents]:
        if linked(ancestor):
            raise RuntimeError('Source path must not contain links or junctions')
    docs = []
    for root, dirs, files in os.walk(src, followlinks=False):
        dirs[:] = sorted(d for d in dirs if not d.startswith('.') and not linked(Path(root) / d))
        for name in sorted(files):
            p = Path(root) / name
            if p.suffix.lower() != '.md' or name.startswith('.') or linked(p):
                continue
            if not p.resolve().is_relative_to(src.resolve()):
                raise RuntimeError('Document outside source root')
            lines = p.read_text(encoding='utf-8-sig').splitlines()
            title = next((s[2:] for s in lines if s.startswith('# ')), p.stem)
            docs.append(dict(path=p.relative_to(src).as_posix(), title=title, lines=lines))
    if not docs:
        raise RuntimeError(f'No Markdown documents found in {src}')
    return docs

def chunks(docs):
    result = []
    for di, doc in enumerate(docs):
        lines = doc['lines']
        start = next((i for i, s in enumerate(lines) if s.startswith('# ')), 0)
        section = doc['title']
        fence = False
        in_embedded_component = False
        begin = start
        def emit(end):
            if any(s.strip() for s in lines[begin:end]):
                result.append(dict(doc=di, start=begin+1, end=end, section=section,
                                   text='\n'.join(lines[begin:end])))
        for i in range(start, len(lines)):
            line = lines[i]
            if line.startswith('export function TypesafeExample('):
                if i > begin:
                    emit(i)
                in_embedded_component = True
                continue
            if in_embedded_component:
                if line == '}':
                    begin = i + 1
                    in_embedded_component = False
                continue
            if line.lstrip().startswith('```'):
                fence = not fence
            if not fence and re.match(r'^#{1,6} ', line):
                if i > begin:
                    emit(i)
                begin = i
                section = line.lstrip('# ').strip()
            elif not fence and not line.strip() and i - begin >= 28:
                emit(i)
                begin = i
        emit(len(lines))
    return result

def main(source=None):
    src = Path(source) if source else SOURCE
    docs = collect(src)
    passages = chunks(docs)
    payload = dict(docs=docs, chunks=passages, built=datetime.datetime.now().isoformat(timespec='seconds'))
    # Escape '<' so source text cannot close the JSON script element.
    data = json.dumps(payload, ensure_ascii=True).replace('<', '\\u003c')
    template = (HERE / 'template.html').read_text(encoding='utf-8')
    content = template.replace('__DOCUMENT_DATA__', data).replace('__DOCS_DIR__', str(src))
    (HERE / 'Jev Docs.html').write_text(content, encoding='utf-8')
    print(f'Built Jev Docs.html: {len(docs)} documents, {len(passages)} passages.')

if __name__ == '__main__':
    main()
