#!/usr/bin/env python3
"""Скачивает реальные фотографии с https://slm24.ru/ в папки проекта.
Запуск из корня проекта:  python3 tools/fetch_images.py
Нужен Python 3 и интернет. Существующие файлы не перезаписываются.

Что делает:
  1) 22 фото шкафов-купе       -> images/products/cp-<id>.jpg
  2) главный баннер сайта       -> images/banners/banner_main.webp
  3) фото категорий             -> images/cats/<slug>.jpg  (первое фото товара раздела, только если файла ещё нет)
  4) фото выполненных работ     -> images/projects/ + images/projects/manifest.json
В конце печатает отчёт: что скачано и чего не хватило."""
import json, os, re, sys, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://slm24.ru"
PRODUCTS = {
  "images/products/cp-247.jpg": "https://slm24.ru/media/CACHE/images/products_images/DSC_8969/2e6655d335db7ec5d9a89576ae34e803.jpg",
  "images/products/cp-111.jpg": "https://slm24.ru/media/CACHE/images/products_images/IMG_2702__%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_Ce75wFt/9046168f49b716485a665c40cd216c26.jpg",
  "images/products/cp-110.jpg": "https://slm24.ru/media/CACHE/images/products_images/IMG_2698_%D0%B1%D0%B5%D0%B7_%D1%88%D1%82%D0%B0%D1%82%D0%B8%D0%B2%D0%B0__%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_YNm8sTQ/0e908125fbe0c4a0852b9ba192a3f43d.jpg",
  "images/products/cp-105.jpg": "https://slm24.ru/media/CACHE/images/products_images/IMG_2670__%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_s6U6kRh/d4028811c601e0cfd7e6b587c7788ffd.jpg",
  "images/products/cp-57.jpg": "https://slm24.ru/media/CACHE/images/products_images/%D1%88%D0%BA%D0%B0%D1%841__%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F/b5d8b4394e3295d581353ae288f78597.jpg",
  "images/products/cp-77.jpg": "https://slm24.ru/media/CACHE/images/products_images/%D0%A8%D0%BA%D0%B0%D1%84__%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_Ym0nJ4u/88e5039a8bb4b06cdd216f068aacd1a4.jpg",
  "images/products/cp-128.jpg": "https://slm24.ru/media/CACHE/images/products_images/%D0%A8%D0%BA%D0%B0%D1%84_3_%D0%B4%D0%B2%D0%B5%D1%80%D0%B8_1__%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F/34a9a5d5d32533e34f65b35319cb3c01.jpg",
  "images/products/cp-150.jpg": "https://slm24.ru/media/CACHE/images/products_images/1/74e99a63bb7f05afb9a6145f749ffa2b.JPG",
  "images/products/cp-64.jpg": "https://slm24.ru/media/CACHE/images/products_images/%D0%A8%D0%BA%D0%B0%D1%842_NzmzY3y/596de443740dc4aa18583faf773733e6.jpg",
  "images/products/cp-74.jpg": "https://slm24.ru/media/CACHE/images/products_images/%D0%A8%D0%BA%D0%B0%D1%84-%D0%BA%D1%83%D0%BF%D0%B5_1f7cxUY/ffdd3fe2664d6e00079de7ae519bf5bd.jpg",
  "images/products/cp-252.jpg": "https://slm24.ru/media/CACHE/images/products_images/DSC_8980/faebf6585a73698742bdca2ae7bd9fbf.jpg",
  "images/products/cp-60.jpg": "https://slm24.ru/media/CACHE/images/products_images/11_5IiNtNf/9993fd8600c84e10982f3df9876ffcb7.jpg",
  "images/products/cp-326.jpg": "https://slm24.ru/media/CACHE/images/products_images/NZ6_5333__%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F/6abe05229b32af5ce698a70b9332e558.jpg",
  "images/products/cp-141.jpg": "https://slm24.ru/media/CACHE/images/products_images/DSC_9912__%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_gFylnBU/837e8e113027701b41e7339f9b5e516b.jpg",
  "images/products/cp-59.jpg": "https://slm24.ru/media/CACHE/images/products_images/1_6osskYW/cc555a6b42480887bef7f57971bed9ae.jpg",
  "images/products/cp-323.jpg": "https://slm24.ru/media/CACHE/images/products_images/NZ6_5316__%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F/4be82679e7c513bc3828515c1e82910f.jpg",
  "images/products/cp-305.jpg": "https://slm24.ru/media/CACHE/images/products_images/%D0%A8%D0%BA%D0%B0%D1%84-%D0%BA%D1%83%D0%BF%D0%B5-0014__%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F/2d3139478aa72e18faf291d88d9d8ceb.jpg",
  "images/products/cp-120.jpg": "https://slm24.ru/media/CACHE/images/products_images/%D0%A8%D0%BA%D0%B0%D1%84_1.1/a9fecab3acedfe1265da4cb4388c46be.jpg",
  "images/products/cp-121.jpg": "https://slm24.ru/media/CACHE/images/products_images/%D0%A8%D0%BA%D0%B0%D1%84_2.2/c71c5e80df48746697e470736273f235.jpg",
  "images/products/cp-95.jpg": "https://slm24.ru/media/CACHE/images/products_images/%D0%A8%D0%BA%D0%B0%D1%84_1__%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F/ff28caa440f898c70b5f3649ab36b425.jpg",
  "images/products/cp-124.jpg": "https://slm24.ru/media/CACHE/images/products_images/%D0%A8%D0%BA%D0%B0%D1%84_1_A4PLqou/fd3387432b28b3337233bf8347f121cf.jpg",
  "images/products/cp-327.jpg": "https://slm24.ru/media/CACHE/images/products_images/NZ6_5338__%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F/c2acdc6e8f88285103b66502ada1410f.jpg"
}
BANNER = {"images/banners/banner_main.webp": SITE + "/static/media/banner_main.webp"}
CATS = ["kuhni-klassika","shkafyi-kupe","detskie","gorkastenka","mebel-iz-massiva","garderobnyie","mezhkomnatnyie-peregorodki","mebel-dlya-vannoj-komnatyi","prihozhie","mebel-dlya-spalnoj-komnatyi","ofisnaya-mebel"]
SKIP = re.compile(r"(logo|phone|max25|tg26|vk|/ok|email|forward|close|placeholder|review_none|cash|master|mir|visa|cert_images|reviews_images|discont_images|/static/)", re.I)
done, failed = [], []

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

def save(rel, url):
    dst = os.path.join(ROOT, rel)
    if os.path.exists(dst) and os.path.getsize(dst) > 0:
        return True
    try:
        data = get(url)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        open(dst, "wb").write(data)
        done.append(rel); print("OK  ", rel); return True
    except Exception as e:
        failed.append((rel, str(e))); print("FAIL", rel, e, file=sys.stderr); return False

def page_images(path):
    html = get(SITE + path).decode("utf-8", "ignore")
    urls = re.findall(r"(?:src|href)=[\"']([^\"']+\.(?:jpe?g|png|webp|JPG|JPEG))[\"']", html)
    out = []
    for u in urls:
        u = urllib.parse.urljoin(SITE + path, u)
        u = urllib.parse.quote(urllib.parse.unquote(u), safe=":/%")
        if u.startswith(SITE) and not SKIP.search(u) and u not in out:
            out.append(u)
    return out

for rel, url in {**PRODUCTS, **BANNER}.items():
    save(rel, url)

for slug in CATS:
    rel = "images/cats/%s.jpg" % slug
    if os.path.exists(os.path.join(ROOT, rel)):
        continue
    try:
        imgs = [u for u in page_images("/" + slug) if "products_images" in u]
        if imgs: save(rel, imgs[0])
        else: failed.append((rel, "на странице раздела нет фото товаров"))
    except Exception as e:
        failed.append((rel, str(e)))

manifest = []
try:
    for i, u in enumerate(page_images("/design_projects/")[:60], 1):
        ext = os.path.splitext(urllib.parse.urlparse(u).path)[1].lower() or ".jpg"
        name = "project-%02d%s" % (i, ext)
        if save("images/projects/" + name, u): manifest.append(name)
except Exception as e:
    failed.append(("images/projects/*", str(e)))
if manifest:
    json.dump(manifest, open(os.path.join(ROOT, "images/projects/manifest.json"), "w"), indent=1)

print("\nСкачано: %d, не получено: %d" % (len(done), len(failed)))
for rel, why in failed: print("  НЕТ:", rel, "-", why)
