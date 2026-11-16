/* СЛМ — демо-концепция редизайна. Ванильный JS, без внешних зависимостей. */
(function () {
  "use strict";
  var D = window.SLM, C = D.categories, P = D.products, R = D.reviews;
  var PH1 = "+7 (902) 982-64-97", T1 = "+79029826497";
  var PH2 = "+7 (963) 191-61-45", T2 = "+79631916145";
  var MAIL = "dalshin@inbox.ru";
  var TG = "https://t.me/slm2025slm";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  var money = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0") + "\u00a0₽"; };
  var page = document.body.getAttribute("data-page");
  var catBySlug = {}; C.forEach(function (c) { catBySlug[c.slug] = c; });

  /* ---------- общий каркас ---------- */
  function catLinks(cls) {
    return C.map(function (c) { return '<a href="category.html?c=' + c.slug + '">' + esc(c.menu) + "</a>"; }).join("");
  }
  function chrome() {
    var head = '<div class="ribbon">Демонстрационная концепция редизайна. Это не официальный сайт компании — оригинал: <a href="https://slm24.ru/" rel="noopener">slm24.ru</a></div>' +
      '<header class="site-head"><div class="wrap head-in">' +
      '<a class="logo" href="index.html" aria-label="СЛМ — Самая Лучшая Мебель, на главную"><img src="images/brand/logo.png" alt="СЛМ — самая лучшая мебель" width="190" height="38"></a>' +
      '<nav class="nav" aria-label="Основная навигация">' +
      '<div class="dd"><button type="button" aria-haspopup="true">Каталог</button><div class="dd-menu">' + catLinks() + '<a href="catalog.html"><b>Весь каталог</b></a></div></div>' +
      '<a href="index.html#works">Работы</a><a href="reviews.html">Отзывы</a><a href="index.html#promo">Акции</a><a href="index.html#about">О компании</a><a href="contacts.html">Контакты</a></nav>' +
      '<a class="head-tel" href="tel:' + T1 + '">' + PH1 + "</a>" +
      '<button class="burger" type="button" aria-label="Открыть меню" aria-expanded="false"><span></span></button>' +
      "</div></header>" +
      '<div class="drawer" id="drawer"><a href="catalog.html">Каталог</a><div class="sub">' + catLinks() + "</div>" +
      '<h4>Разделы</h4><a href="index.html#works">Работы</a><a href="reviews.html">Отзывы</a><a href="index.html#promo">Акции</a><a href="index.html#about">О компании</a><a href="contacts.html">Контакты</a>' +
      '<a href="tel:' + T1 + '">' + PH1 + '</a><a href="tel:' + T2 + '">' + PH2 + '</a>' +
      '<button class="btn" type="button" data-quiz>Узнать стоимость кухни</button></div>';
    var foot = '<footer class="foot"><div class="wrap"><div class="foot-grid">' +
      '<div><span class="logo-f"><img src="images/brand/logo.png" alt="СЛМ" width="160" height="34"></span><p>Мебель на заказ в Красноярске по индивидуальным размерам от производителя.</p></div>' +
      "<div><h4>Каталог</h4><ul>" + C.slice(0, 6).map(function (c) { return '<li><a href="category.html?c=' + c.slug + '">' + esc(c.menu) + "</a></li>"; }).join("") + '<li><a href="catalog.html">Все категории</a></li></ul></div>' +
      '<div><h4>Ещё на slm24.ru</h4><ul>' +
      [["about/", "О компании"], ["dostavka_i_sborka/", "Доставка и сборка"], ["oplata_i_rassrochka/", "Оплата и рассрочка"], ["garanty/", "Гарантии"], ["certs/", "Сертификаты"], ["design_projects/", "Наши работы"], ["for_design/", "Сотрудничество"]].map(function (l) { return '<li><a href="https://slm24.ru/' + l[0] + '" rel="noopener">' + l[1] + "</a></li>"; }).join("") + "</ul></div>" +
      '<div><h4>Контакты</h4><ul><li><a href="tel:' + T1 + '">' + PH1 + '</a></li><li><a href="tel:' + T2 + '">' + PH2 + '</a></li><li><a href="mailto:' + MAIL + '">' + MAIL + '</a></li>' +
      '<li>ул. Чернышевского, 98, офис 320</li><li>ул. Авиаторов, 5, ТК «Авиатор», этаж 1</li>' +
      '<li><a href="' + TG + '" rel="noopener">Telegram</a> · <a href="https://max.ru/join/RbMRE7QV8gGf_kgVmmKJ-XLSDBFNG09-RkxAK9O_B60" rel="noopener">Max</a> · <a href="https://vk.ru/club236534824" rel="noopener">VK</a> · <a href="https://ok.ru/profile/577897253028" rel="noopener">OK</a></li></ul></div>' +
      '</div><p class="foot-bottom">Демонстрационная концепция редизайна сайта slm24.ru, не является официальным ресурсом ООО «Самая лучшая мебель». Материалы — с исходного сайта. Не является офертой.</p></div></footer>' +
      '<div class="mbar"><a class="btn btn--ghost" href="tel:' + T1 + '">Позвонить</a><button class="btn" type="button" data-quiz>Узнать стоимость</button></div>';
    var h = $("#site-head"), f = $("#site-foot");
    if (h) h.innerHTML = head;
    if (f) f.innerHTML = foot;
    var b = $(".burger");
    if (b) b.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      b.setAttribute("aria-expanded", open); b.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    });
    $$("#drawer a").forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("menu-open"); }); });
    $$("#drawer [data-quiz]").forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("menu-open"); }); });
  }

  /* ---------- изображения с запасным вариантом ---------- */
  function imgTag(src, alt, label, lazy) {
    return '<img src="' + esc(src) + '" alt="' + esc(alt) + '"' + (lazy === false ? "" : ' loading="lazy"') + ' data-fb="' + esc(label || alt) + '">';
  }
  function onImgError(t) {
    if (t.tagName !== "IMG" || !t.hasAttribute("data-fb") || !t.parentNode) return;
    var p = t.parentNode; var lbl = t.getAttribute("data-fb");
    if (t.hasAttribute("data-cat-fb")) { p.classList.add("noimg"); t.remove(); return; }
    if (p.hasAttribute("data-hide-on-error")) { p.remove(); return; }
    var d = document.createElement("div"); d.className = "ph-fallback"; d.textContent = lbl;
    t.replaceWith(d);
  }
  document.addEventListener("error", function (e) { onImgError(e.target); }, true);
  /* картинки из статического HTML могли упасть до подключения скрипта */
  function sweepImages() { $$("img[data-fb]").forEach(function (i) { if (i.complete && i.naturalWidth === 0) onImgError(i); }); }

  /* ---------- диалоги ---------- */
  function dlg(html, cls) {
    var d = document.createElement("dialog"); if (cls) d.className = cls; d.innerHTML = '<div class="dlg">' + html + "</div>";
    document.body.appendChild(d);
    d.addEventListener("close", function () { d.remove(); });
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
    if (d.showModal) d.showModal(); else d.setAttribute("open", "");
    var x = $(".x", d); if (x) x.addEventListener("click", function () { d.close(); });
    return d;
  }
  function lightbox(src, alt) {
    var d = dlg('<button class="x" type="button" aria-label="Закрыть">×</button><img src="' + esc(src) + '" alt="' + esc(alt) + '">', "lb");
    return d;
  }
  function mailto(subject, body) {
    return "mailto:" + MAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  /* форма расчёта кухни: вопросы и варианты — с исходного сайта */
  var STEPS = [
    ["Выберите форму кухни", ["Угловая", "Прямая", "П-образная", "С островом"]],
    ["Выберите стиль кухни", ["Современный", "Классический", "Скандинавский", "Модерн", "Неоклассика", "Прованс", "Лофт"]],
    ["Выберите материал фасадов", ["МДФ краска", "МДФ пленка", "МДФ пластик", "МДФ шпон", "Массив дерева"]],
    ["Выберите тип столешницы", ["Пластик", "Искусственный камень", "Жидкий камень"]],
    ["Укажите примерные размеры помещения в м.п.", null],
    ["Хотите вместе с кухонным гарнитуром приобрести бытовую технику?", ["Да", "Нет"]],
    ["Насколько срочной для Вас является покупка кухни?", ["В ближайшие 1-2 недели", "В ближайшие 1-2 месяца", "В ближайшие полгода", "Общий интерес"]]
  ];
  function quiz() {
    var ans = [], i = 0;
    var d = dlg("");
    var box = $(".dlg", d);
    function draw() {
      if (i < STEPS.length) {
        var s = STEPS[i];
        box.innerHTML = '<div class="dlg-top"><div><p class="note">Вопрос ' + (i + 1) + " из " + STEPS.length + '</p><h3>' + esc(s[0]) + '</h3></div><button class="x" type="button" aria-label="Закрыть">×</button></div><div class="bar"><i style="width:' + (i / STEPS.length * 100) + '%"></i></div>' +
          (s[1] ? '<div class="opts">' + s[1].map(function (o) { return '<button type="button" class="opt" aria-pressed="false">' + esc(o) + "</button>"; }).join("") + "</div>" :
            '<div class="form"><label for="q-size">Размеры, м.п.</label><input id="q-size" inputmode="decimal" placeholder="Например, 3,2"><button type="button" class="btn" id="q-next">Далее</button></div>') +
          (i ? '<button type="button" class="btn btn--ghost" id="q-back" style="margin-top:12px">Назад</button>' : "");
        $(".x", box).addEventListener("click", function () { d.close(); });
        $$(".opt", box).forEach(function (b) { b.addEventListener("click", function () { ans[i] = b.textContent; i++; draw(); }); });
        var n = $("#q-next", box); if (n) n.addEventListener("click", function () { ans[i] = $("#q-size", box).value.trim() || "не указано"; i++; draw(); });
        var bk = $("#q-back", box); if (bk) bk.addEventListener("click", function () { i--; draw(); });
      } else {
        box.innerHTML = '<div class="dlg-top"><div><p class="note">Последний шаг</p><h3>Оставьте свои данные</h3></div><button class="x" type="button" aria-label="Закрыть">×</button></div><div class="bar"><i style="width:100%"></i></div>' +
          '<form class="form" id="q-form"><div><label for="q-name">Имя</label><input id="q-name" required autocomplete="name"></div><div><label for="q-tel">Телефон</label><input id="q-tel" type="tel" required autocomplete="tel" placeholder="+7"></div><button class="btn" type="submit">Узнать стоимость</button>' +
          '<p class="note">Демо-версия: сервера заявок нет. Кнопка откроет письмо в вашей почте с заполненными ответами — отправьте его сами или позвоните: <a href="tel:' + T1 + '">' + PH1 + "</a>.</p></form>";
        $(".x", box).addEventListener("click", function () { d.close(); });
        $("#q-form", box).addEventListener("submit", function (e) {
          e.preventDefault();
          var body = STEPS.map(function (s, k) { return s[0] + " " + ans[k]; }).join("\n") + "\n\nИмя: " + $("#q-name", box).value + "\nТелефон: " + $("#q-tel", box).value;
          window.location.href = mailto("Расчёт стоимости кухни", body);
        });
      }
    }
    draw();
  }
  function simpleForm(title) {
    var d = dlg('<div class="dlg-top"><h3>' + esc(title) + '</h3><button class="x" type="button" aria-label="Закрыть">×</button></div>' + formHtml("m"));
    bindForm($("form", d), title);
  }
  function formHtml(p) {
    return '<form class="form" data-form><div><label for="' + p + '-n">Имя</label><input id="' + p + '-n" name="n" required autocomplete="name"></div><div><label for="' + p + '-t">Телефон</label><input id="' + p + '-t" name="t" type="tel" required autocomplete="tel" placeholder="+7"></div><div><label for="' + p + '-c">Комментарий</label><textarea id="' + p + '-c" name="c" placeholder="Что хотите заказать, примерные размеры"></textarea></div><button class="btn" type="submit">Отправить заявку</button><p class="note">Демо-версия: сервера заявок нет. Кнопка откроет письмо в вашей почте — отправьте его сами или позвоните: <a href="tel:' + T1 + '">' + PH1 + "</a>.</p></form>";
  }
  function bindForm(f, subj, extra) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = function (n) { return f.elements[n].value; };
      window.location.href = mailto(subj || "Заявка на дизайн-проект", (extra ? extra + "\n" : "") + "Имя: " + v("n") + "\nТелефон: " + v("t") + "\nКомментарий: " + v("c"));
    });
  }
  document.addEventListener("click", function (e) {
    var q = e.target.closest("[data-quiz]"); if (q) { e.preventDefault(); quiz(); return; }
    var cb = e.target.closest("[data-callback]"); if (cb) { e.preventDefault(); simpleForm("Заказать звонок"); return; }
    var lb = e.target.closest("[data-lb]"); if (lb && lb.querySelector(".ph-fallback")) return; if (lb) { e.preventDefault(); lightbox(lb.getAttribute("data-lb"), lb.getAttribute("data-alt") || ""); }
  });

  /* ---------- блоки ---------- */
  function catCard(c) {
    var t = '<span class="cat-t">' + esc(c.name) + "</span>";
    return '<a class="cat" href="category.html?c=' + c.slug + '">' + imgTag(c.img, c.name, c.name, false).replace("<img ", "<img data-cat-fb ") + t + "</a>";
  }
  function prodCard(p) {
    var priceText = Number(p.price) > 0 ? "от " + money(p.price) : "Цена по запросу";
    return '<a class="card" href="product.html?id=' + p.id + '"><div class="ph">' + imgTag(p.img, p.name, p.name) + '</div><div class="tx"><h3>' + esc(p.name) + '</h3><span class="price">' + priceText + "</span></div></a>";
  }
  function revCard(r, long) {
    return '<figure class="rev' + (long ? " rev--long" : "") + '"><blockquote>' + esc(r.text) + "</blockquote><figcaption><cite>" + esc(r.name) + "</cite><small>" + esc(r.date) + "</small></figcaption></figure>";
  }
  function crumbs(items) {
    return '<ol class="crumbs">' + items.map(function (it, i) { return "<li>" + (it[1] && i < items.length - 1 ? '<a href="' + it[1] + '">' + esc(it[0]) + "</a>" : '<span aria-current="page">' + esc(it[0]) + "</span>") + "</li>"; }).join("") + "</ol>";
  }

  /* ---------- страницы ---------- */
  function initHome() {
    $("#home-cats").innerHTML = C.map(catCard).join("");
    var works = [
      ["images/cats/kuhni-klassika.jpg", "Кухня"], ["images/cats/shkafyi-kupe.jpg", "Шкаф-купе"], ["images/cats/detskie.jpg", "Детская"], ["images/cats/gorkastenka.jpg", "Горка"]
    ].map(function (w) { return { src: w[0], alt: w[1], always: true }; });
    P.slice(0, 11).forEach(function (p) { works.push({ src: p.img, alt: p.name }); });
    function drawWorks(list) {
      $("#works-grid").innerHTML = list.map(function (w) {
        return '<button type="button" data-lb="' + esc(w.src) + '" data-alt="' + esc(w.alt) + '"' + (w.always ? "" : " data-hide-on-error") + ' aria-label="Открыть фото: ' + esc(w.alt) + '">' + imgTag(w.src, w.alt, w.alt) + "</button>";
      }).join("");
    }
    drawWorks(works);
    /* фотографии выполненных работ: список создаёт tools/fetch_images.py (images/projects/manifest.json) */
    if (window.fetch) fetch("images/projects/manifest.json").then(function (r) { return r.ok ? r.json() : []; }).then(function (m) {
      if (!m || !m.length) return;
      var pr = m.slice(0, 24).map(function (f) { return { src: "images/projects/" + f, alt: "Выполненная работа компании СЛМ" }; });
      drawWorks(pr.concat(works));
    }).catch(function () {});
    $("#home-reviews").innerHTML = [R[1], R[2], R[0]].map(function (r) { return revCard(r); }).join("");
    var f = $("#home-form"); if (f) bindForm(f, "Заявка на бесплатный дизайн-проект");
  }
  function initCatalog() { $("#all-cats").innerHTML = C.map(catCard).join(""); }
  function initCategory() {
    var slug = new URLSearchParams(location.search).get("c");
    var c = catBySlug[slug] || null;
    var root = $("#cat-root");
    $("#cat-nav").innerHTML = C.map(function (x) { return '<a class="chip" href="category.html?c=' + x.slug + '"' + (c && x.slug === c.slug ? ' aria-current="page"' : "") + ">" + esc(x.name) + "</a>"; }).join("");
    if (!c) {
      document.title = "Категория не найдена — СЛМ (демо)";
      root.innerHTML = '<div class="empty"><h2>Такой категории нет</h2><p>Выберите раздел в списке выше или откройте <a href="catalog.html">весь каталог</a>.</p></div>';
      return;
    }
    document.title = c.name + " на заказ в Красноярске — СЛМ (демо-редизайн)";
    $("#cat-title").textContent = c.name + " на заказ";
    $("#cat-crumbs").innerHTML = crumbs([["Главная", "index.html"], ["Каталог", "catalog.html"], [c.name]]);
    var items = P.filter(function (p) { return p.cat === c.slug; });
    if (!items.length) {
      var previewSlugs = ["kuhni-klassika", "gorkastenka", "mebel-iz-massiva", "garderobnyie", "mezhkomnatnyie-peregorodki", "prihozhie"];
      if (previewSlugs.indexOf(c.slug) !== -1) {
        root.innerHTML = '<div class="grid category-preview">' +
          '<a class="card" href="' + esc(c.url) + '" target="_blank" rel="noopener noreferrer">' +
          '<div class="ph">' + imgTag(c.img, c.name, c.name) + '</div>' +
          '<div class="tx"><h3>Примеры мебели — ' + esc(c.name) + '</h3>' +
          '<p class="muted">Фотография раздела с оригинального сайта СЛМ. Посмотрите модели, варианты исполнения и актуальные цены в исходном каталоге.</p>' +
          '<span class="price">Смотреть ассортимент на slm24.ru ↗</span></div></a></div>' +
          '<p class="note" style="margin-top:24px">Это демонстрационная карточка раздела, а не отдельная товарная позиция. Названия моделей и цены не добавлены без проверки.</p>';
      } else {
        root.innerHTML = '<div class="empty"><h2>Фотографии и цены этого раздела — на исходном сайте</h2><p>В демо-концепции показаны только те товары, которые удалось получить с исходного сайта. Для раздела «' + esc(c.name) + '» их пока нет — ничего не придумано.</p><div class="btn-row"><a class="btn" href="' + c.url + '" rel="noopener">Открыть раздел на slm24.ru</a><button class="btn btn--ghost" type="button" data-callback>Заказать звонок</button></div></div>';
      }
      return;
    }
    root.innerHTML = '<div class="toolbar"><div><label for="q">Поиск по названию</label><input id="q" type="search" placeholder="Например, Яхта"></div><div><label for="sort">Сортировка</label><select id="sort"><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option><option value="name">По названию</option></select></div></div>' +
      '<p class="muted" id="count"></p><div class="grid" id="grid"></div>' +
      '<p class="note" style="margin-top:28px">Подкатегории на исходном сайте: <a href="https://slm24.ru/shkafyi-kupe-recessed/" rel="noopener">встраиваемые</a>, <a href="https://slm24.ru/shkafyi-kupe-square/" rel="noopener">прямые</a>, <a href="https://slm24.ru/shkafyi-kupe-angle/" rel="noopener">угловые</a>. Фильтры по форме, монтажу и материалу дверей появятся, когда у каждого товара будут эти данные.</p>';
    function draw() {
      var q = $("#q").value.trim().toLowerCase(), s = $("#sort").value;
      var list = items.filter(function (p) { return p.name.toLowerCase().indexOf(q) > -1; });
      list.sort(function (a, b) {
        if (s === "name") return a.name.localeCompare(b.name, "ru");
        var ap = Number(a.price) || 0, bp = Number(b.price) || 0;
        if (!ap && bp) return 1;
        if (ap && !bp) return -1;
        return s === "price-desc" ? bp - ap : ap - bp;
      });
      $("#count").textContent = "Найдено: " + list.length + " из " + items.length;
      $("#grid").innerHTML = list.length ? list.map(prodCard).join("") : "<p>Ничего не найдено. Попробуйте другое название.</p>";
    }
    $("#q").addEventListener("input", draw); $("#sort").addEventListener("change", draw); draw();
  }
  function initProduct() {
    var idParam = new URLSearchParams(location.search).get("id");
    var id = Number(idParam);
    var p = P.filter(function (x) { return Number(x.id) === id; })[0];
    var root = $("#prod-root");
    if (!p) {
      document.title = "Товар не найден — СЛМ (демо)";
      root.innerHTML = '<div class="empty"><h2>Товар не найден в актуальном каталоге</h2>' +
        '<p>Возможно, ссылка ведёт на старую карточку или товар больше не входит в эту демонстрационную подборку.</p>' +
        '<div class="btn-row"><a class="btn" href="catalog.html">Открыть весь каталог</a>' +
        '<a class="btn btn--ghost" href="https://slm24.ru/" rel="noopener">Перейти на исходный сайт</a></div></div>';
      return;
    }
    var c = catBySlug[p.cat];
    var priceText = Number(p.price) > 0 ? "от " + money(p.price) : "Цена по запросу";
    document.title = p.name + " — СЛМ (демо-редизайн)";
    $("#prod-crumbs").innerHTML = crumbs([["Главная", "index.html"], ["Каталог", "catalog.html"], [c ? c.name : "Каталог", c ? "category.html?c=" + c.slug : "catalog.html"], [p.name]]);
    root.innerHTML = '<div class="prod"><button class="prod-img" type="button" data-lb="' + esc(p.img) + '" data-alt="' + esc(p.name) + '" aria-label="Открыть фото крупно">' + imgTag(p.img, p.name, p.name, false) + "</button>" +
      '<div class="prod-info"><h1 style="font-size:clamp(1.8rem,4.5vw,2.8rem)">' + esc(p.name) + '</h1><span class="price">' + priceText + "</span>" +
      (p.desc ? "<p>" + esc(p.desc) + "</p>" : '<p class="muted">Описание товара уточняйте у производителя.</p>') +
      '<p class="muted">Полные характеристики и актуальную стоимость можно уточнить у производителя.</p>' +
      '<div class="btn-row"><button class="btn" type="button" data-callback>Заказать звонок</button><a class="btn btn--ghost" href="tel:' + T1 + '">' + PH1 + '</a></div>' +
      '<ul class="specs">' + (c ? '<li>Раздел: <a href="category.html?c=' + c.slug + '">' + esc(c.name) + '</a></li>' : '') +
      '<li><a href="' + esc(p.url) + '" rel="noopener">Полное описание на slm24.ru</a></li></ul>' +
      '<div class="btn-row"><a class="btn btn--ghost" href="' + (c ? 'category.html?c=' + c.slug : 'catalog.html') + '">← Вернуться в каталог</a><a class="btn btn--ghost" href="' + TG + '" rel="noopener">Написать в Telegram</a></div></div></div>' +
      (c ? '<section class="sec" style="padding-bottom:0"><h2 style="margin-bottom:24px">Ещё в этом разделе</h2><div class="grid" id="rel"></div></section>' : '');
    if (c) {
      var rel = P.filter(function (x) { return x.cat === p.cat && x.id !== p.id; })
        .sort(function (a, b) { return Math.abs((Number(a.price) || 0) - (Number(p.price) || 0)) - Math.abs((Number(b.price) || 0) - (Number(p.price) || 0)); }).slice(0, 4);
      $("#rel").innerHTML = rel.map(prodCard).join("");
    }
  }
  function initReviews() { $("#rev-list").innerHTML = R.map(function (r) { return revCard(r, true); }).join(""); }
  function initContacts() { var f = $("#c-form"); if (f) bindForm(f, "Вопрос с сайта"); }

  chrome();
  ({ home: initHome, catalog: initCatalog, category: initCategory, product: initProduct, reviews: initReviews, contacts: initContacts }[page] || function () {})();
  var cur = { reviews: "reviews.html", contacts: "contacts.html" }[page];
  sweepImages();
  if (cur) $$('.nav a[href="' + cur + '"]').forEach(function (a) { a.setAttribute("aria-current", "page"); });
})();
