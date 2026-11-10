#!/usr/bin/env python3
"""수거 — 그림 저장소 inbox/ 의 그림을 받아 img/ · thumb/ · rec/ 로 옮기고 index/ · jobs/NEXT.md 를 다시 짓는다.
그림 저장소의 워크플로(ingest.yml)가 부른다. 손으로 돌려도 같다(docs/STRUCTURE.md 3절).

  python3 tools/ingest.py --img ../style-atelier-img            inbox 수거 + 색인 + NEXT
  python3 tools/ingest.py --img ../style-atelier-img --refresh  inbox 는 그대로, 색인 · NEXT 만
  python3 tools/ingest.py --img ../style-atelier-img --check    무엇을 할지 보이기만

받는 이름(일감 slots.json 의 file 과 같아야 한다):
  inbox/<그림 이름>.png|.webp|.jpg|.jpeg   그림
  inbox/<그림 이름>.blocked.txt            막힌 칸(거절 문구)
  inbox/<그림 이름>.note.txt               세션이 남긴 한 줄(선택)
  inbox/<그림 이름>.gen.json               API 로 그린 것의 생성 정보(tools/draw-api.cjs) → 기록의 generation
모르는 이름 · 이미 있는 그림은 inbox 에 그대로 두고 index/problems.json 과 NEXT.md 에 적는다(덮지 않는다)."""
import argparse, datetime, hashlib, json, os, re, sys
from pathlib import Path

IMG_EXT = ('.png', '.webp', '.jpg', '.jpeg')
W, H, THUMB = 1024, 1536, 512
COLS = ['id', 'subject', 'world', 'kind', 'exposure', 'model', 'n', 'recipe', 'direction', 'face', 'paint', 'light', 'fx', 'job', 'added', 'rating']


def today():
    return (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=9)).date().isoformat()


def load_jobs(img):
    jobs, by_file = [], {}
    for d in sorted((img / 'jobs').glob('j*/slots.json')):
        j = json.loads(d.read_text(encoding='utf-8'))
        jobs.append(j)
        for s in j['slots']:
            by_file[s['file']] = (j, s)
    return jobs, by_file


def save_json(p, obj):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


def take_image(img, src, job, slot, note, check, gen=None):
    from PIL import Image
    base = slot['file']
    dst = img / 'img' / slot['subject'] / slot['world'] / (base + '.webp')
    th = img / 'thumb' / slot['subject'] / slot['world'] / (base + '.webp')
    rec = img / 'rec' / (base + '.json')
    if dst.exists() or rec.exists():
        return '이미 있다(덮지 않음): ' + base
    raw = src.read_bytes()
    im = Image.open(src)
    im.load()
    w0, h0 = im.size
    im = im.convert('RGB')
    resized = False
    if (w0, h0) != (W, H) and abs((w0 / h0) - (W / H)) < 0.03:
        im = im.resize((W, H), Image.LANCZOS)
        resized = True
    if check:
        return None
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, 'WEBP', quality=90, method=6)
    t = im.copy()
    t.thumbnail((THUMB, THUMB), Image.LANCZOS)
    th.parent.mkdir(parents=True, exist_ok=True)
    t.save(th, 'WEBP', quality=80, method=6)
    r = {k: slot.get(k) for k in ('slot', 'subject', 'subject_commit', 'world', 'kind', 'exposure', 'model', 'n', 'recipe', 'prompt_file', 'prompt_sha256')}
    r = dict({'id': base, 'job': job['job']}, **r)
    r.update({'file': str(dst.relative_to(img)), 'thumb': str(th.relative_to(img)), 'size': list(im.size), 'resized_from': [w0, h0] if resized else None,
              'source': {'name': src.name, 'sha256': hashlib.sha256(raw).hexdigest(), 'size': [w0, h0]},
              'note': note, 'generation': gen, 'added': today(), 'rating': None})
    save_json(rec, r)
    src.unlink()
    return None


def take_blocked(img, src, job, slot, check):
    p = img / 'rec' / 'blocked' / (slot['file'] + '.json')
    if p.exists():
        return '막힘 기록이 이미 있다: ' + slot['file']
    if check:
        return None
    save_json(p, {'id': slot['file'], 'job': job['job'], 'slot': slot['slot'], 'model': slot['model'], 'exposure': slot.get('exposure'),
                  'recipe': slot['recipe']['id'], 'message': src.read_text(encoding='utf-8', errors='replace').strip()[:2000], 'added': today()})
    src.unlink()
    return None


def ingest(img, check):
    _, by_file = load_jobs(img)
    inbox = img / 'inbox'
    problems, done = [], []
    if not inbox.exists():
        return problems, done
    files = sorted(p for p in inbox.iterdir() if p.is_file() and not p.name.startswith('.') and p.name != 'README.md')
    notes = {p.name[:-len('.note.txt')]: p for p in files if p.name.endswith('.note.txt')}
    gens = {p.name[:-len('.gen.json')]: p for p in files if p.name.endswith('.gen.json')}
    for p in files:
        name = p.name
        if name.endswith('.note.txt') or name.endswith('.gen.json'):
            continue
        if name.endswith('.blocked.txt'):
            base, kind = name[:-len('.blocked.txt')], 'blocked'
        elif p.suffix.lower() in IMG_EXT:
            base, kind = p.stem, 'image'
        else:
            problems.append({'file': 'inbox/' + name, 'why': '모르는 꼴(그림 · .blocked.txt · .note.txt 만)'})
            continue
        if base not in by_file:
            problems.append({'file': 'inbox/' + name, 'why': '어느 일감에도 없는 이름'})
            continue
        job, slot = by_file[base]
        try:
            if kind == 'image':
                note = notes[base].read_text(encoding='utf-8', errors='replace').strip()[:500] if base in notes else None
                gen = json.loads(gens[base].read_text(encoding='utf-8')) if base in gens else None
                err = take_image(img, p, job, slot, note, check, gen)
                if not err and not check:
                    for side in (notes, gens):
                        if base in side:
                            side[base].unlink()
            else:
                err = take_blocked(img, p, job, slot, check)
        except Exception as e:  # 열리지 않는 그림 — 두고 적는다
            err = '열 수 없다: %s' % e
        if err:
            problems.append({'file': 'inbox/' + name, 'why': err})
        else:
            done.append(base + (' (막힘)' if kind == 'blocked' else ''))
    for base, p in list(notes.items()) + list(gens.items()):
        if base not in by_file:
            problems.append({'file': 'inbox/' + p.name, 'why': '어느 일감에도 없는 이름'})
    return problems, done


def build_index(img):
    rows, blocked = [], []
    for p in sorted((img / 'rec').glob('*.json')):
        r = json.loads(p.read_text(encoding='utf-8'))
        parts = {x['axis']: x['key'] + '@' + x['v'] for x in r['recipe']['parts']}
        rows.append([r['id'], r['subject'], r['world'], r['kind'], r.get('exposure'), r['model'], r['n'], r['recipe']['id'],
                     parts.get('direction'), parts.get('face'), parts.get('paint'), parts.get('light'), parts.get('fx'), r['job'], r['added'], r.get('rating')])
    for p in sorted((img / 'rec' / 'blocked').glob('*.json')):
        blocked.append(json.loads(p.read_text(encoding='utf-8')))
    return {'version': 1, 'cols': COLS, 'rows': rows}, blocked


def build_next(img, jobs, problems):
    have = {p.stem for p in (img / 'rec').glob('*.json')}
    blk = {p.stem for p in (img / 'rec' / 'blocked').glob('*.json')}
    open_rows, closed = [], 0
    for j in jobs:
        files = [s['file'] for s in j['slots']]
        d = sum(1 for f in files if f in have)
        b = sum(1 for f in files if f in blk and f not in have)
        if d + b >= len(files):
            closed += 1
            continue
        open_rows.append('| [%s](%s/REQUEST.md) | %s | %d / %d%s | %s |' % (j['job'], j['job'], j.get('label') or '', d, len(files), (' · 막힘 %d' % b) if b else '', j['model']))
    out = ['# 열린 일감', '',
           'GPT 세션: 아래에서 모델이 **chatgpt** 인 일감 **하나**를 골라 그 `REQUEST.md` 만 읽고 그대로 해줘. 위에서부터 고르면 된다. api26 · api25 일감은 Claude 가 API 로 그린다. 이 파일은 워크플로가 다시 쓴다 — 고치지 않는다.', '']
    if open_rows:
        out += ['| 일감 | 이름 | 그린 칸 | 모델 |', '|---|---|---|---|'] + open_rows
    else:
        out += ['열린 일감이 없다.']
    out += ['', '닫힌 일감 %d개.' % closed]
    if problems:
        out += ['', '## inbox 에 남은 것', ''] + ['- `%s` — %s' % (x['file'], x['why']) for x in problems]
    return '\n'.join(out) + '\n'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--img', default='../style-atelier-img')
    ap.add_argument('--refresh', action='store_true')
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    img = Path(a.img).resolve()
    jobs, _ = load_jobs(img)
    problems, done = ([], []) if a.refresh else ingest(img, a.check)
    for d in done:
        print(('받을 것 ' if a.check else '받았다 ') + d)
    for x in problems:
        print('남김 %s — %s' % (x['file'], x['why']))
    if a.check:
        return 0
    idx, blocked = build_index(img)
    save_json(img / 'index' / 'images.json', idx)
    save_json(img / 'index' / 'blocked.json', blocked)
    if not a.refresh:
        save_json(img / 'index' / 'problems.json', problems)
    else:
        pp = img / 'index' / 'problems.json'
        problems = json.loads(pp.read_text(encoding='utf-8')) if pp.exists() else []
    have = {r[0] for r in idx['rows']} | {b['id'] for b in blocked}
    save_json(img / 'index' / 'pending.json', sorted({s['file'] for j in jobs for s in j['slots'] if s['file'] not in have}))
    (img / 'jobs').mkdir(parents=True, exist_ok=True)
    (img / 'jobs' / 'NEXT.md').write_text(build_next(img, jobs, problems), encoding='utf-8')
    print('색인 %d장 · 막힘 %d · 일감 %d · 남김 %d' % (len(idx['rows']), len(blocked), len(jobs), len(problems)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
