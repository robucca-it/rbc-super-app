"""Rakit index.html dari src/: template + CSS PWA Robucca + ikon + aplikasi."""
from pathlib import Path

root = Path(__file__).parent
src = root / 'src'
css = (src / 'styles/pwa.css').read_text() + '\n' + (src / 'styles/extra.css').read_text()
js = (src / 'icons.js').read_text() + '\n' + (src / 'app.js').read_text()
page = (src / 'template.html').read_text().replace('/*PWA_CSS*/', css).replace('/*APP_JS*/', js)
(root / 'index.html').write_text(page)
print('index.html', len(page), 'byte')
