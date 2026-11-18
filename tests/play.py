import sys, json, time
from playwright.sync_api import sync_playwright
URL = sys.argv[1]; scenario = sys.argv[2]; shots = sys.argv[3]
def read_item(page):
    return page.evaluate("""() => {
      const cup = document.querySelector('.stage .cup');
      const five = document.querySelector('.stage .given .tok-five');
      const ten = document.querySelector('.stage .given .tok-ten');
      const given = cup ? Number(cup.textContent) : five ? 5 : ten ? 10 : 0;
      const added = document.querySelectorAll('.stage .loose .tok').length;
      const type = cup ? 'cup' : ten ? 'ten' : 'flash';
      const here = [...document.querySelectorAll('.track .cell')].findIndex(c => c.classList.contains('here'));
      return {given, added, type, here, max: Number(document.querySelector('.track').dataset.max)};
    }""")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width':1280,'height':720})
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append(m.text) if m.type=='error' else None)
    pg.goto(URL + '?reset&nolimit&speed=' + ('1' if scenario=='shots' else '8'))
    pg.wait_for_selector('.play-btn'); pg.screenshot(path=f'{shots}/{scenario}-00-start.png')
    taken = set()
    def shot(name):
        if name not in taken:
            taken.add(name); pg.screenshot(path=f'{shots}/{scenario}-{name}.png')
    sessions = 1 if scenario=='shots' else 4
    for s in range(sessions):
        pg.wait_for_selector('.play-btn', timeout=60000); pg.keyboard.press('Space') if s else pg.click('.play-btn')
        if scenario=='shots':
            pg.wait_for_selector('.demo'); time.sleep(1.0); shot('01-demo-flash-shown'); time.sleep(1.2); shot('02-demo-hidden-hopping')
        n = 0
        while True:
            try:
                pg.wait_for_function("() => document.querySelector('.play-btn') || document.querySelector('.big') && !document.querySelector('.play') || ['answer','hop','ok'].includes(document.querySelector('.play')?.dataset.mode)", timeout=60000)
            except Exception as e:
                errors.append('timeout waiting'); break
            if not pg.query_selector('.play'): break
            mode = pg.evaluate("document.querySelector('.play').dataset.mode")
            if mode == 'answer':
                it = read_item(pg); ans = it['given'] + it['added']; n += 1
                wrong = (scenario=='cupwrong' and it['type']=='cup') or (scenario=='shots' and n in (2,))
                shot(f"10-{it['type']}-answering-max{it['max']}")
                target = ans + (1 if wrong and ans < it['max'] else -1 if wrong else 0)
                if scenario=='shots' and n==3:
                    pg.click(f'.track .cell:nth-child({target+1})'); pg.click('.ctl.ok')   # pointer path
                else:
                    d = target - it['here']
                    for _ in range(abs(d)): pg.keyboard.press('ArrowRight' if d>0 else 'ArrowLeft')
                    pg.keyboard.press('Space')
                if not wrong: time.sleep(0.15); shot(f"20-{it['type']}-correct")
            elif mode == 'hop':
                shot('30-guided-start'); pg.keyboard.press('ArrowRight')
            elif mode == 'ok':
                shot('31-guided-landed'); pg.keyboard.press('Space')
            time.sleep(0.03)
        time.sleep(0.3)
    data = pg.evaluate("JSON.parse(localStorage.getItem('numbergame'))")
    pr = data['profiles']['p1']
    print(scenario, json.dumps({'placement':pr['placement'], 'skill':pr['skill'], 'passed':pr['passed'], 'sessions':pr['sessions'], 'log':len(pr['log']), 'demos':pr['demos']}))
    print('last log', json.dumps(pr['log'][-1]))
    pg.goto(URL + 'parent.html'); pg.wait_for_selector('table'); pg.screenshot(path=f'{shots}/{scenario}-90-parent.png')
    print('errors', errors)
    b.close()
