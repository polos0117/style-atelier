"""수거 · 일감 검사 — python3 tests/ingest.py
임시 그림 저장소에 make-job 으로 일감을 만들고, inbox 에 그림 · 막힘 · 메모 · 모르는 이름을 넣어 수거한다."""
import json, os, shutil, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
d = Path(tempfile.mkdtemp())
try:
    img = d / 'img'
    img.mkdir()
    run = lambda *a: subprocess.run(['node', str(ROOT / 'tools/make-job.cjs'), '--img', str(img)] + list(a), check=True, capture_output=True, text=True).stdout
    out = run('--recipes', 'semi_smooth,illus_23d,oil_hikey,styl3d,anime_matte', '--subject', 'sam.wenyang', '--world', 'samguk', '--label', 't')
    jobs = sorted(p.name for p in (img / 'jobs').glob('j*'))
    assert jobs == ['j0001-t', 'j0002-t'], jobs
    s1 = json.loads((img / 'jobs/j0001-t/slots.json').read_text())
    assert len(s1['slots']) == 4 and s1['slots'][0]['file'].endswith('__chatgpt__1')
    req = (img / 'jobs/j0001-t/REQUEST.md').read_text()
    assert req.count('```text') == 4 and s1['slots'][0]['file'] in req and 'inbox/' in req
    for s in s1['slots']:
        assert (img / s['prompt_file']).read_text().startswith('A full-body')
    # 같은 칸은 다시 안 들어간다 — --repeat 면 번호를 올린다
    assert '새 칸이 없다' in run('--recipes', 'semi_smooth', '--subject', 'sam.wenyang', '--world', 'samguk')
    run('--recipes', 'semi_smooth', '--subject', 'sam.wenyang', '--world', 'samguk', '--repeat')
    s3 = json.loads((img / 'jobs/j0003/slots.json').read_text())
    assert s3['slots'][0]['n'] == 2, s3['slots'][0]
    # 축 바꾸기 — 짝 안 맞는 3D 는 빠진다
    out = run('--base', 'semi_smooth', '--vary', 'face', '--subject', 'el.fe', '--world', 'fantasy', '--dry')
    assert 'stylised3d' in out and '건너뜀' in out and 'el.fe__fantasy-world' in out

    nxt = (img / 'jobs/NEXT.md').read_text()
    assert 'j0001-t' in nxt and '0 / 4' in nxt

    inbox = img / 'inbox'
    inbox.mkdir()
    a, b, c = (s['file'] for s in s1['slots'][:3])
    Image.new('RGB', (1024, 1536), (120, 90, 60)).save(inbox / (a + '.png'))
    Image.new('RGB', (1000, 1500), (60, 90, 120)).save(inbox / (b + '.png'))          # 2:3 이지만 크기가 다르다 → 맞춘다
    (inbox / (b + '.note.txt')).write_text('얼굴이 둥글다\n')
    (inbox / (a + '.gen.json')).write_text(json.dumps({'model': 'gpt-image-2.6-sunburst', 'usage': {'output_tokens': 1132}}))
    (inbox / (c + '.blocked.txt')).write_text('This request violates our content policies.\n')
    (inbox / 'nobody__chatgpt__1.png').write_bytes(b'x')
    subprocess.run([sys.executable, str(ROOT / 'tools/ingest.py'), '--img', str(img)], check=True, capture_output=True)

    w = img / 'img/sam.wenyang/samguk'
    assert (w / (a + '.webp')).exists() and (img / 'thumb/sam.wenyang/samguk' / (a + '.webp')).exists()
    assert Image.open(w / (b + '.webp')).size == (1024, 1536)
    assert max(Image.open(img / 'thumb/sam.wenyang/samguk' / (a + '.webp')).size) == 512
    ra = json.loads((img / 'rec' / (a + '.json')).read_text())
    assert ra['generation']['usage']['output_tokens'] == 1132 and ra['note'] is None
    rb = json.loads((img / 'rec' / (b + '.json')).read_text())
    assert rb['generation'] is None
    assert rb['resized_from'] == [1000, 1500] and rb['note'] == '얼굴이 둥글다' and rb['recipe']['id'] == 'km1-il1-pr1-cs1-xf1' and rb['job'] == 'j0001-t'
    assert (img / 'rec/blocked' / (c + '.json')).exists()
    left = sorted(p.name for p in inbox.iterdir())
    assert left == ['nobody__chatgpt__1.png'], left
    ix = json.loads((img / 'index/images.json').read_text())
    assert len(ix['rows']) == 2 and ix['cols'][7] == 'recipe'
    row = dict(zip(ix['cols'], ix['rows'][0]))
    assert row['face'].endswith('@v1') and row['subject'] == 'sam.wenyang'
    pend = json.loads((img / 'index/pending.json').read_text())
    assert s1['slots'][3]['file'] in pend and a not in pend and c not in pend, pend
    pr = json.loads((img / 'index/problems.json').read_text())
    assert len(pr) == 1 and '어느 일감에도' in pr[0]['why']
    nxt = (img / 'jobs/NEXT.md').read_text()
    assert '2 / 4 · 막힘 1' in nxt and 'nobody__chatgpt__1.png' in nxt

    # 이미 있는 그림은 덮지 않는다
    Image.new('RGB', (1024, 1536)).save(inbox / (a + '.png'))
    subprocess.run([sys.executable, str(ROOT / 'tools/ingest.py'), '--img', str(img)], check=True, capture_output=True)
    assert (inbox / (a + '.png')).exists()
    assert any('덮지 않음' in x['why'] for x in json.loads((img / 'index/problems.json').read_text()))

    # 찾기 · 빈 칸
    f = subprocess.run(['node', str(ROOT / 'tools/find.cjs'), '--img', str(img), '--face', 'semi_soft'], check=True, capture_output=True, text=True).stdout
    assert a in f and '1장' in f, f
    g = subprocess.run(['node', str(ROOT / 'tools/find.cjs'), '--img', str(img), '--gaps', '--base', 'semi_smooth', '--vary', 'paint', '--subject', 'sam.wenyang', '--world', 'samguk'], check=True, capture_output=True, text=True).stdout
    assert '있음' in g and '비었음' in g and '짝 안 맞음' in g, g
    print('PASS 수거: API 생성 정보 · 일감 끊기 · 겹침 막기 · 번호 올리기 · webp · 썸네일 · 기록 · 막힘 · 메모 · 모르는 이름 · 덮지 않기 · 색인 · NEXT · 찾기 · 빈 칸')
finally:
    shutil.rmtree(d)
