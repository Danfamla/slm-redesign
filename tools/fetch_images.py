#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Скачивает карточки товаров и фотографии каталога СЛМ в локальный проект.
Запуск: python tools/fetch_images.py
Требуется: pip install requests beautifulsoup4
Скрипт сохраняет отчёт и не удаляет исходные данные.
"""
import json, re, sys, time, hashlib
from pathlib import Path
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://slm24.ru'
DATA = ROOT / 'js' / 'data.js'
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}
CATEGORIES = [
 ('kuhni-klassika','Кухни'), ('shkafyi-kupe','Шкафы-купе'), ('detskie','Детские'),
 ('gorkastenka','Горка/Стенка'), ('mebel-iz-massiva','Мебель из массива'),
 ('garderobnyie','Гардеробные'), ('mezhkomnatnyie-peregorodki','Межкомнатные перегородки'),
 ('mebel-dlya-vannoj-komnatyi','Мебель для ванной комнаты'), ('prihozhie','Прихожие'),
 ('mebel-dlya-spalnoj-komnatyi','Мебель для спальной комнаты'), ('ofisnaya-mebel','Офисная мебель')]

session = requests.Session(); session.headers.update(HEADERS)

def get_soup(url):
    r = session.get(url, timeout=35); r.raise_for_status()
    r.encoding = r.apparent_encoding or 'utf-8'
    return BeautifulSoup(r.text, 'html.parser')

def abs_url(value, base):
    if not value: return ''
    value = value.strip().split()[0]
    if value.startswith('data:'): return ''
    return urljoin(base, value)

def best_image(img, base):
    if not img: return ''
    for key in ('data-src','data-original','data-lazy-src','src'):
        val = img.get(key)
        if val and not val.startswith('data:image'): return abs_url(val, base)
    srcset = img.get('srcset') or img.get('data-srcset')
    if srcset:
        vals = [x.strip().split()[0] for x in srcset.split(',') if x.strip()]
        if vals: return abs_url(vals[-1], base)
    return ''

def product_id(url):
    m = re.search(r'/product/(?:[^/]+/)?(\d+)(?:/|$)', urlparse(url).path)
    return m.group(1) if m else hashlib.md5(url.encode()).hexdigest()[:9]

def card_for(anchor):
    node = anchor
    for _ in range(6):
        if not getattr(node, 'parent', None): break
        node = node.parent
        text = ' '.join(node.stripped_strings)
        if node.find('img') and len(text) > 5 and len(text) < 1400:
            return node
    return anchor.parent

def scrape_category(slug, label):
    url = f'{SITE}/{slug}'
    print(f'\n[{label}] {url}')
    soup = get_soup(url)
    found, seen = [], set()
    for a in soup.find_all('a', href=True):
        href = urljoin(url, a['href'])
        if '/product/' not in urlparse(href).path: continue
        href = href.split('#')[0]
        if href in seen: continue
        seen.add(href)
        card = card_for(a)
        img = card.find('img') if card else None
        image_url = best_image(img, url)
        text = ' '.join(card.stripped_strings) if card else ' '.join(a.stripped_strings)
        name = ' '.join(a.stripped_strings).strip() or (img.get('alt','').strip() if img else '')
        if not name or len(name) < 3:
            name = text[:120].strip()
        # Avoid navigation links accidentally identified as product pages.
        if not image_url: continue
        found.append({'id': product_id(href), 'cat': slug, 'name': name[:180], 'url': href,
                      'image_url': image_url, 'card_text': text[:700]})
    # Enrich each product from its own detail page (title, description, price, main photo).
    products = []
    for i, item in enumerate(found, 1):
        try:
            ps = get_soup(item['url'])
            og = ps.find('meta', property='og:image')
            if og and og.get('content'): item['image_url'] = abs_url(og['content'], item['url'])
            title = ps.find('meta', property='og:title')
            h1 = ps.find('h1')
            if h1 and h1.get_text(' ', strip=True): item['name'] = h1.get_text(' ', strip=True)
            elif title and title.get('content'): item['name'] = title['content'].strip()
            desc = ps.find('meta', attrs={'name':'description'}) or ps.find('meta', property='og:description')
            item['desc'] = desc.get('content','').strip() if desc else ''
            body_text = ' '.join(ps.stripped_strings)
            price_match = re.search(r'(?:от\s*)?([\d\s\u00a0]{4,})\s*(?:₽|руб\.?|р\.)', body_text, re.I)
            if price_match:
                digits = re.sub(r'\D','',price_match.group(1))
                item['price'] = int(digits) if digits else None
            else: item['price'] = None
        except Exception as e:
            print(f'  ! Не удалось открыть карточку {item["url"]}: {e}')
            item['desc']=''; item['price']=None
        products.append(item)
        print(f'  {i}/{len(found)} {item["name"][:70]}')
        time.sleep(.15)
    return products

def download(url, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 1000: return True
    r = session.get(url, timeout=40); r.raise_for_status()
    ctype = r.headers.get('content-type','')
    if not ctype.startswith('image/') and not re.search(r'\.(jpg|jpeg|png|webp)(?:\?|$)', url, re.I):
        raise ValueError('ответ не похож на изображение: '+ctype)
    dest.write_bytes(r.content)
    return True

def main():
    all_products=[]; errors=[]
    for slug,label in CATEGORIES:
        try:
            items=scrape_category(slug,label)
            if not items: errors.append(f'{label}: на странице не найдены карточки с изображениями')
            all_products.extend(items)
        except Exception as e:
            errors.append(f'{label}: {e}'); print('  ОШИБКА:',e)
    # Download all unique product images; preserve old files.
    used=set(); downloaded=0
    for item in all_products:
        ext=Path(urlparse(item['image_url']).path).suffix.lower()
        if ext not in ('.jpg','.jpeg','.png','.webp'): ext='.jpg'
        dest=ROOT/'images'/'products'/f"slm-{item['cat']}-{item['id']}{ext}"
        item['img']=dest.relative_to(ROOT).as_posix()
        if item['image_url'] not in used:
            used.add(item['image_url'])
            try: download(item['image_url'],dest); downloaded+=1
            except Exception as e: errors.append(f"Фото {item['name']}: {e}"); item['img']=''
        else:
            # duplicate URL: point to the first saved image
            prior=next((x['img'] for x in all_products if x is not item and x.get('image_url')==item['image_url'] and x.get('img')), '')
            item['img']=prior
    # Keep the existing 22 verified wardrobe entries, append only new categories.
    old_text=DATA.read_text(encoding='utf-8')
    try:
        old_json=re.search(r'window\.SLM\s*=\s*(\{.*\})\s*;?',old_text,re.S).group(1)
        old=json.loads(old_json)
    except Exception as e:
        raise RuntimeError('Не удалось безопасно прочитать js/data.js: '+str(e))
    old_products=old.get('products',[])
    existing={(p.get('cat'),str(p.get('id'))) for p in old_products}
    additions=[]
    for p in all_products:
        if (p['cat'],str(p['id'])) in existing or not p.get('img'): continue
        additions.append({'id':p['id'],'cat':p['cat'],'name':p['name'],'price':p.get('price') or 0,
                          'desc':p.get('desc',''),'img':p['img'],'url':p['url']})
    old['products']=old_products+additions
    # Write JS as JSON-compatible object, retaining UTF-8 Russian text.
    DATA.write_text('/* Данные каталога СЛМ. Проверьте цены и карточки перед публикацией. */\nwindow.SLM='+json.dumps(old,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    report={'categories':{slug:sum(1 for p in all_products if p['cat']==slug) for slug,_ in CATEGORIES},
            'products_found':len(all_products),'images_downloaded_or_present':downloaded,
            'new_products_added':len(additions),'errors':errors,
            'note':'Цены, не найденные на странице товара, записаны как 0; проверьте их вручную. Скрипт не выдумывает цены.'}
    (ROOT/'catalog-download-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print('\n=== ГОТОВО ===')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    print('\nОтчёт: catalog-download-report.json')

if __name__=='__main__':
    try: main()
    except Exception as e:
        print('\nКРИТИЧЕСКАЯ ОШИБКА:',e)
        sys.exit(1)
