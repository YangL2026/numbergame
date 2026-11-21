# Plays the game with a simulated child. Usage: play.py URL scenario shotdir
# scenarios: perfect (always right), cupwrong (misses every cup item), shots (one session, some misses, screenshots)
import sys, json, time
from playwright.sync_api import sync_playwright
URL = sys.argv[1]; scenario = sys.argv[2]; shots = sys.argv[3]

def read_item(page):
    return page.evaluate("""() => {
      const eq = document.querySelector('.eq');
      const here = [...document.querySelectorAll('.track .cell')].findIndex(c => c.classList.contains('here'));
      return {given: Number(eq.dataset.given), added: Number(eq.dataset.added), type: eq.dataset.type, here,
              max: Number(document.querySelector('.track').dataset.max)};
    }""")

def move_to(pg, here, target):
    d = target - here
    for _ in range(abs(d)): pg.keyboard.press('ArrowRight' if d > 0 else 'ArrowLeft')

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1280, 'height': 720})
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    pg.goto(URL + '?reset&nolimit&speed=' + ('1' if scenario == 'shots' else '8'))
    pg.wait_for_selector('.name-btn'); pg.screenshot(path=f'{shots}/{scenario}-00-names.png')
    pg.click('.name-btn >> nth=0')
    pg.wait_for_selector('.play-btn'); pg.screenshot(path=f'{shots}/{scenario}-01-start.png')
    taken = set()
    def shot(name):
        if name not in taken:
            taken.add(name); pg.screenshot(path=f'{shots}/{scenario}-{name}.png')
    sessions = 1 if scenario == 'shots' else 8
    for s in range(sessions):
        pg.wait_for_selector('.play-btn', timeout=60000)
        pg.click('.play-btn')
        n = 0
        while True:
            try:
                pg.wait_for_function("() => document.querySelector('.play-btn') || ['start','answer','hop','ok'].includes(document.querySelector('.play')?.dataset.mode)", timeout=60000)
            except Exception:
                errors.append('timeout waiting'); break
            if not pg.query_selector('.play'): break
            mode = pg.evaluate("document.querySelector('.play').dataset.mode")
            if mode == 'start':
                it = read_item(pg)
                shot(f"10-start-{it['type']}-given{it['given']}")
                move_to(pg, it['here'], it['given'])
                if scenario == 'shots' and n == 1: time.sleep(0.4); shot('11-start-placed')
                pg.keyboard.press('Space')
            elif mode == 'answer':
                it = read_item(pg); ans = it['given'] + it['added']; n += 1
                wrong = (scenario == 'cupwrong' and it['type'] == 'cup') or (scenario == 'shots' and n == 3)
                shot(f"20-answer-{it['type']}-max{it['max']}")
                target = ans + (1 if wrong and ans < it['max'] else -1 if wrong else 0)
                move_to(pg, it['here'], target)
                pg.keyboard.press('Space')
                if not wrong: time.sleep(0.9 if scenario == 'shots' else 0.1); shot(f"30-right-{it['type']}")
                else: time.sleep(1.2); shot('40-wrong')
            elif mode == 'hop':
                shot('50-guided'); pg.keyboard.press('ArrowRight')
            elif mode == 'ok':
                shot('51-guided-landed'); pg.keyboard.press('Space')
                if scenario == 'shots' and 'turn' not in taken:
                    try:
                        pg.wait_for_selector('.yourturn', timeout=1500); time.sleep(0.4); shot('turn'); pg.keyboard.press('Space')
                    except Exception: pass
            time.sleep(0.03)
        time.sleep(0.3)
    data = pg.evaluate("JSON.parse(localStorage.getItem('numbergame'))")
    pr = data['profiles']['p1']
    print(scenario, json.dumps({'name': pr['name'], 'placement': pr['placement'], 'skill': pr['skill'], 'passed': pr['passed'],
                                'sessions': [(x['items'], x['firstTry']) for x in pr['sessions']], 'log': len(pr['log'])}))
    print('last log', json.dumps(pr['log'][-1]))
    pg.goto(URL + 'parent.html'); pg.wait_for_selector('table'); pg.screenshot(path=f'{shots}/{scenario}-90-parent.png')
    print('errors', errors)
    b.close()
