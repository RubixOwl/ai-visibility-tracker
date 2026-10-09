"""Meaningful checks for citation rejection and the local HTTP path."""
import json
import threading
from http.server import ThreadingHTTPServer
from urllib.request import Request, urlopen

import server

passage_id = next(i for i, p in enumerate(server.PASSAGES)
                  if server.DOCS[p['doc']]['path'] == 'concepts/system-one.md'
                  and 'text input only' in p['text'])
source = server.PASSAGES[passage_id]['text']
quote = 'Jev currently accepts text input only.'
line_number = next(n for n in range(server.PASSAGES[passage_id]['start'], server.PASSAGES[passage_id]['end'] + 1)
                   if quote in server.DOCS[server.PASSAGES[passage_id]['doc']]['lines'][n - 1])


def fake_response(claim):
    return {'message': {'content': json.dumps({'claims': [claim]})}}


valid = {'text': 'Jev accepts text.', 'source_id': 1, 'line_number': line_number}
result = server.answer('Does Jev accept images?', [passage_id],
                       ask=lambda *a, **k: fake_response(valid))
assert result['claims'][0]['quote'] in source
assert result['claims'][0]['path'] == 'concepts/system-one.md'
assert result['claims'][0]['start'] <= result['claims'][0]['end']

invalid = {'text': 'Jev accepts images.', 'source_id': 1, 'line_number': 999999}
try:
    server.answer('Does Jev accept images?', [passage_id],
                  ask=lambda *a, **k: fake_response(invalid))
except ValueError as error:
    assert 'cite a shown source line' in str(error)
else:
    raise AssertionError('Fabricated quote was accepted')

calls = iter([fake_response(invalid), fake_response(valid)])
repaired = server.answer('Does Jev accept images?', [passage_id],
                         ask=lambda *a, **k: next(calls))
assert quote in repaired['claims'][0]['quote']

httpd = ThreadingHTTPServer(('127.0.0.1', 0), server.Handler)
thread = threading.Thread(target=httpd.serve_forever, daemon=True)
thread.start()
try:
    root = f'http://127.0.0.1:{httpd.server_port}'
    with urlopen(root + '/', timeout=5) as r:
        assert b'Explain with local AI' in r.read()
    payload = json.dumps({'question': 'Does Jev accept images?',
                          'passages': [passage_id]}).encode()
    request = Request(root + '/api/answer', payload,
                      {'Content-Type': 'application/json'})
    with urlopen(request, timeout=120) as r:
        response = json.load(r)
    assert response['claims']
    assert all(c['quote'] == server.DOCS[c['doc']]['lines'][c['start'] - 1]
               for c in response['claims'])
    print('PASS: local HTTP answer, exact source line, invalid citation rejection, repair attempt.')
finally:
    httpd.shutdown()
    httpd.server_close()
