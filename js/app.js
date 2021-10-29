let products;
let productsElements;

let productBrands = [];
let productTypes = [];

const sortFilter = document.getElementById("sort-type");
const brandFilter = document.getElementById("filter-brand");
const typeFilter = document.getElementById("filter-type");
const nameFilter = document.getElementById("filter-name");

const catalogElement = document.querySelector(".catalog");

(async () => {
  let response = await fetch("data/products.json");
  loadProducts(await response.json(), sortFilter.value);
})(); //função imediata, aqui está consumindo o products.json ao invés de http://makeup-api.herokuapp.com/api/v1/products.json

function loadProducts(json, sortType) {
  const elements = sortProduct(json, sortType)
    .map((product) => productItem(product))
    .join("");

  catalogElement.innerHTML = elements;

  productsElements = Array.from(catalogElement.querySelectorAll(".product"));

  loadComboOptions(brandFilter, productBrands.uniq().sort());
  loadComboOptions(typeFilter, productTypes.uniq().sort());
  products = json;
}

function loadComboOptions(element, values) {
  values.map((item) =>
    element.insertAdjacentHTML("beforeend", `<option>${item}</option>`)
  );
}

nameFilter.addEventListener("keyup", loadFilters);
brandFilter.addEventListener("change", loadFilters);
typeFilter.addEventListener("change", loadFilters);
sortFilter.addEventListener("change", (e) => {
  loadProducts(products, sortFilter.value);
  loadFilters();
});

function loadFilters() {
  let name = nameFilter.value;
  let brand = brandFilter.value;
  let type = typeFilter.value;

  productsElements.forEach((product) => {
    if (validateProduct(product, name, brand, type)) {
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });
}

function validateProduct(productElement, name, brand, type) {
  let search = new RegExp(name, "i");

  let checkName = search.test(productElement.dataset.name);

  let checkBrand = productElement.dataset.brand.includes(brand);
  let checkType = productElement.dataset.type.includes(type);

  return checkName && checkBrand && checkType;
}

function productItem(product) {
  productBrands = productBrands.concat([product.brand]);
  productTypes = productTypes.concat([product.product_type]);

  return `<div class="product" data-name="${product.name}" 
  data-brand="${product.brand}" data-type="${product.product_type}" 
  tabindex="${product.id}">
  <figure class="product-figure">
    <img src="${product.image_link}" width="215" height="215" alt="${
    product.name
  }" onerror="javascript:this.src='img/unavailable.png'">
  </figure>
  <section class="product-description">
    <h1 class="product-name">${product.name}</h1>
    <div class="product-brands"><span class="product-brand background-brand">${
      product.brand == null ? "" : product.brand
    }</span>
<span class="product-brand background-price">R$ ${(
    parseFloat(product.price) * 5.5
  ).toFixed(2)}</span></div>
  </section>
  <section class="product-details">${productDetails(product)}</section>
</div>`;
}

function productDetails(product) {
  let details = ["brand", "rating", "price", "product_type", "category"];

  return Object.entries(product)
    .filter(([name, value]) => details.includes(name))
    .map(
      ([name, value]) =>
        `<div class="details-row">
        <div>${name.capitalize()}</div>
        <div class="details-bar">
          <div class="details-bar-bg" style="width= 250">${value}</div>
        </div>
      </div>`
    )
    .join("");
}

function sortProduct(products, sortType) {
  switch (sortType) {
    case "Melhor Avaliados":
      return products.sort((a, b) =>
        a.rating > b.rating ? -1 : a.rating < b.rating ? 1 : 0
      );
    case "Menores Preços":
      return products.sort((a, b) =>
        parseFloat(a.price) > parseFloat(b.price)
          ? 1
          : parseFloat(a.price) < parseFloat(b.price)
          ? -1
          : 0
      );
    case "Maiores Preços":
      return products.sort((a, b) =>
        parseFloat(a.price) > parseFloat(b.price)
          ? -1
          : parseFloat(a.price) < parseFloat(b.price)
          ? 1
          : 0
      );
    case "A-Z":
      return products.sort((a, b) =>
        a.name > b.name ? 1 : a.name < b.name ? -1 : 0
      );
    case "Z-A":
      return products.sort((a, b) =>
        a.name > b.name ? -1 : a.name < b.name ? 1 : 0
      );
  }
}

Array.prototype.uniq = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
};

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
