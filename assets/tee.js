(function () {
  var SHOP = 'https://a7c873-3.myshopify.com/api/2026-10/graphql.json';
  var TOKEN = 'b88ba7ab29ae7af0836201bd9727fbb8';   // public storefront token, made for use in web pages
  var PRODUCT = 'gid://shopify/Product/8781184794849';
  var SWATCH = { 'Ash': '#e3e3e1', 'Dark Heather': '#4a4d52', 'Light Blue': '#b9d3ea', 'Violet': '#8e86c9', 'Azalea': '#f2779f', 'Black': '#1b1b1b' };
  var $ = function (id) { return document.getElementById(id); };
  var form = $('tee-form'), note = $('tee-note'), variants = [], pick = { Color: null, Size: null };

  function api(query, variables) {
    return fetch(SHOP, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN }, body: JSON.stringify({ query: query, variables: variables || {} }) })
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (j) { if (j.errors) throw new Error('api'); return j.data; });
  }
  function opt(v, name) { for (var i = 0; i < v.selectedOptions.length; i++) if (v.selectedOptions[i].name === name) return v.selectedOptions[i].value; }
  function current() { for (var i = 0; i < variants.length; i++) if (opt(variants[i], 'Color') === pick.Color && opt(variants[i], 'Size') === pick.Size) return variants[i]; }
  function chips(box, name, values) {
    values.forEach(function (val) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.dataset.value = val;
      if (name === 'Color') { var s = document.createElement('span'); s.className = 'dot'; s.style.background = SWATCH[val] || '#ccc'; b.appendChild(s); }
      b.appendChild(document.createTextNode(val));
      b.addEventListener('click', function () { pick[name] = val; render(); });
      box.appendChild(b);
    });
  }
  function render() {
    ['Color', 'Size'].forEach(function (name) {
      var box = $(name === 'Color' ? 'colors' : 'sizes');
      [].forEach.call(box.children, function (b) { b.setAttribute('aria-pressed', b.dataset.value === pick[name] ? 'true' : 'false'); });
    });
    $('color-name').textContent = pick.Color; $('size-name').textContent = pick.Size;
    var v = current();
    $('price').textContent = v ? '$' + Number(v.price.amount).toFixed(2) : '';
    $('buy').disabled = !v || !v.availableForSale;
    $('buy').textContent = v && !v.availableForSale ? 'Sold out' : 'Buy now';
    if (v && v.image) { $('tee-img').src = v.image.url + (v.image.url.indexOf('?') > -1 ? '&' : '?') + 'width=900'; $('tee-img').alt = pick.Color + ' t-shirt with the word COLLAGE in multicolored cut-out letters'; }
  }

  api('query($id: ID!) { product(id: $id) { options { name optionValues { name } } variants(first: 100) { nodes { id availableForSale price { amount } selectedOptions { name value } image { url } } } } }', { id: PRODUCT })
    .then(function (d) {
      if (!d.product) throw new Error('missing');
      variants = d.product.variants.nodes;
      d.product.options.forEach(function (o) {
        var vals = o.optionValues.map(function (x) { return x.name; });
        if (o.name === 'Color') { chips($('colors'), 'Color', vals); pick.Color = vals[0]; }
        if (o.name === 'Size') { chips($('sizes'), 'Size', vals); pick.Size = vals.indexOf('M') > -1 ? 'M' : vals[0]; }
      });
      $('tee-loading').hidden = true; form.hidden = false; render();
    })
    .catch(function () { $('tee-loading').hidden = true; $('tee-fallback').hidden = false; });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var v = current(); if (!v) return;
    try { if (window.umami) window.umami.track('Buy now clicked', { color: pick.Color, size: pick.Size }); } catch (e) {}
    $('buy').disabled = true; note.textContent = 'Opening secure checkout...';
    api('mutation($lines: [CartLineInput!]!) { cartCreate(input: { lines: $lines }) { cart { checkoutUrl } userErrors { message } } }', { lines: [{ merchandiseId: v.id, quantity: 1 }] })
      .then(function (d) {
        var c = d.cartCreate;
        if (!c.cart || (c.userErrors && c.userErrors.length)) throw new Error('cart');
        window.location.href = c.cart.checkoutUrl;
      })
      .catch(function () { note.textContent = 'Could not open checkout. Please try again.'; $('buy').disabled = false; });
  });
})();
