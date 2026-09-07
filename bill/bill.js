const $ = (id) => document.getElementById(id),
  fields = [
    "businessName",
    "businessPhone",
    "businessAddress",
    "businessEmail",
    "businessGstin",
    "invoiceNumber",
    "billDate",
    "dueDate",
    "paymentMethod",
    "placeOfSupply",
    "taxMode",
    "customerName",
    "customerPhone",
    "customerAddress",
    "customerGstin",
    "notes",
    "terms",
  ];
let logoData = "",
  items = [
    { name: "", hsn: "", qty: 1, unit: "pcs", rate: 0, discount: 0, gst: 18 },
  ];
const money = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(v) || 0);
const n = (v) => Number(v) || 0;
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
const val = (id) => $(id).value.trim();
function date(v) {
  return v
    ? new Date(`${v}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
}
function words(v) {
  const o = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ],
    t = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ],
    two = (x) =>
      x < 20
        ? o[x]
        : `${t[Math.floor(x / 10)]}${x % 10 ? " " + o[x % 10] : ""}`,
    grp = (x) =>
      x < 100
        ? two(x)
        : `${o[Math.floor(x / 100)]} Hundred${x % 100 ? " " + two(x % 100) : ""}`;
  v = Math.round(n(v));
  if (!v) return "Rupees Zero Only";
  let p = [],
    c = Math.floor(v / 1e7);
  v %= 1e7;
  let l = Math.floor(v / 1e5);
  v %= 1e5;
  let th = Math.floor(v / 1e3);
  v %= 1e3;
  if (c) p.push(`${grp(c)} Crore`);
  if (l) p.push(`${grp(l)} Lakh`);
  if (th) p.push(`${grp(th)} Thousand`);
  if (v) p.push(grp(v));
  return `Rupees ${p.join(" ")} Only`;
}
function calc() {
  let subtotal = items.reduce((s, i) => s + n(i.qty) * n(i.rate), 0),
    discount = items.reduce((s, i) => s + n(i.discount), 0),
    taxable = Math.max(0, subtotal - discount),
    tax =
      $("taxMode").value === "none"
        ? 0
        : items.reduce(
            (s, i) =>
              s +
              (Math.max(0, n(i.qty) * n(i.rate) - n(i.discount)) * n(i.gst)) /
                100,
            0,
          ),
    split = $("taxMode").value === "split";
  return {
    subtotal,
    discount,
    taxable,
    tax,
    cgst: split ? tax / 2 : 0,
    sgst: split ? tax / 2 : 0,
    igst: !split && $("taxMode").value === "igst" ? tax : 0,
    grand: taxable + tax,
  };
}
function renderItems() {
  $("itemsBody").innerHTML = items
    .map(
      (i, x) =>
        `<tr data-i="${x}"><td>${x + 1}</td><td><input data-k="name" value="${esc(i.name)}" placeholder="Service or product"></td><td><input data-k="hsn" value="${esc(i.hsn)}" placeholder="9983"></td><td><input data-k="qty" type="number" min=".01" step=".01" value="${i.qty}"></td><td><select data-k="unit"><option ${i.unit === "pcs" ? "selected" : ""}>pcs</option><option ${i.unit === "hours" ? "selected" : ""}>hours</option><option ${i.unit === "kg" ? "selected" : ""}>kg</option><option ${i.unit === "unit" ? "selected" : ""}>unit</option></select></td><td><input data-k="rate" type="number" min="0" step=".01" value="${i.rate}"></td><td><input data-k="discount" type="number" min="0" step=".01" value="${i.discount}"></td><td><input data-k="gst" type="number" min="0" max="100" step=".01" value="${i.gst}"></td><td class="amount-cell">${money(n(i.qty) * n(i.rate) - n(i.discount))}</td><td><button type="button" class="delete-item" aria-label="Delete item">×</button></td></tr>`,
    )
    .join("");
  $("itemsBody")
    .querySelectorAll("input,select")
    .forEach((e) =>
      e.addEventListener("input", () => {
        let i = items[e.closest("tr").dataset.i];
        i[e.dataset.k] =
          e.type === "number" ? Math.max(0, n(e.value)) : e.value;
        renderPreview();
        let r = e.closest("tr");
        r.querySelector(".amount-cell").textContent = money(
          n(i.qty) * n(i.rate) - n(i.discount),
        );
      }),
    );
  $("itemsBody")
    .querySelectorAll(".delete-item")
    .forEach((b) =>
      b.addEventListener("click", () => {
        if (items.length > 1) {
          items.splice(+b.closest("tr").dataset.i, 1);
          renderItems();
          renderPreview();
        }
      }),
    );
}
function renderPreview() {
  let t = calc(),
    biz = val("businessName") || "Your Business Name",
    customer = val("customerName") || "Customer Name",
    rows = items
      .map(
        (i, x) =>
          `<tr><td>${x + 1}</td><td><strong>${esc(i.name || "Product / service")}</strong></td><td>${esc(i.hsn || "—")}</td><td>${n(i.qty)}</td><td>${money(i.rate)}</td><td>${money(i.discount)}</td><td>${$("taxMode").value === "none" ? "—" : n(i.gst) + "%"}</td><td>${money(Math.max(0, n(i.qty) * n(i.rate) - n(i.discount)))}</td></tr>`,
      )
      .join(""),
    taxRows =
      $("taxMode").value === "none"
        ? ""
        : $("taxMode").value === "split"
          ? `<div class="total-row"><span>CGST</span><strong>${money(t.cgst)}</strong></div><div class="total-row"><span>SGST</span><strong>${money(t.sgst)}</strong></div>`
          : `<div class="total-row"><span>IGST</span><strong>${money(t.igst)}</strong></div>`;
  $("invoicePreview").innerHTML =
    `<div class="invoice-head"><div class="invoice-brand">${logoData ? `<img class="invoice-logo" src="${logoData}" alt="Business logo">` : ""}<div><h3>${esc(biz)}</h3><p>${esc(val("businessAddress") || "Business address")}</p><p>${esc(val("businessPhone"))}${val("businessEmail") ? " · " + esc(val("businessEmail")) : ""}</p><p><strong>GSTIN:</strong> ${esc(val("businessGstin") || "Not provided")}</p></div></div><div class="invoice-meta"><h1>TAX INVOICE</h1><p><strong>Invoice No.</strong> ${esc(val("invoiceNumber") || "DRAFT-001")}</p><p><strong>Date</strong> ${date(val("billDate"))}</p><p><strong>Due</strong> ${date(val("dueDate"))}</p></div></div><div class="invoice-blocks"><div><h4>Bill to</h4><strong>${esc(customer)}</strong><p>${esc(val("customerAddress") || "Customer address")}</p><p>${esc(val("customerPhone"))}</p><p>${val("customerGstin") ? "<strong>GSTIN:</strong> " + esc(val("customerGstin")) : ""}</p></div><div><h4>Invoice details</h4><p><strong>Place of supply:</strong> ${esc(val("placeOfSupply") || "—")}</p><p><strong>Payment method:</strong> ${esc(val("paymentMethod"))}</p></div></div><table class="invoice-table"><thead><tr><th>#</th><th>Item description</th><th>HSN/SAC</th><th>Qty</th><th>Rate</th><th>Discount</th><th>GST</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals-area"><div class="amount-words"><strong>Amount in words</strong>${words(t.grand)}<p>${esc(val("notes"))}</p></div><div class="totals"><div class="total-row"><span>Subtotal</span><strong>${money(t.subtotal)}</strong></div><div class="total-row"><span>Total discount</span><strong>− ${money(t.discount)}</strong></div><div class="total-row"><span>Taxable amount</span><strong>${money(t.taxable)}</strong></div>${taxRows}<div class="total-row grand-total"><span>Grand total</span><strong>${money(t.grand)}</strong></div></div></div><div class="invoice-foot"><div><h5>Terms & conditions</h5><p>${esc(val("terms") || "Payment due as per agreed terms. Goods once sold are not returnable.")}</p></div><div class="signature">Authorized signature</div></div>`;
}
function toast(m) {
  let e = $("toast");
  e.textContent = m;
  e.classList.add("show");
  setTimeout(() => e.classList.remove("show"), 2400);
}
function state() {
  return {
    fields: Object.fromEntries(fields.map((id) => [id, $(id).value])),
    items,
    logoData,
  };
}
function apply(s) {
  fields.forEach((id) => {
    if (s.fields?.[id] !== undefined) $(id).value = s.fields[id];
  });
  items = s.items?.length ? s.items : items;
  logoData = s.logoData || "";
  renderItems();
  renderPreview();
}
function reset() {
  fields.forEach((id) => ($(id).value = ""));
  $("billDate").value = new Date().toISOString().slice(0, 10);
  $("paymentMethod").value = "Bank transfer";
  $("taxMode").value = "split";
  items = [
    { name: "", hsn: "", qty: 1, unit: "pcs", rate: 0, discount: 0, gst: 18 },
  ];
  logoData = "";
  renderItems();
  renderPreview();
}
function valid() {
  let req = [
      ["businessName", "Business name"],
      ["invoiceNumber", "Invoice number"],
      ["billDate", "Bill date"],
      ["customerName", "Customer name"],
    ],
    miss = req.find((x) => !val(x[0]));
  if (miss) {
    toast(`${miss[1]} is required`);
    $(miss[0]).focus();
    return false;
  }
  if (items.some((i) => !i.name.trim() || n(i.qty) <= 0 || n(i.rate) < 0)) {
    toast("Add a product with valid quantity and rate");
    return false;
  }
  return true;
}
fields.forEach((id) => $(id).addEventListener("input", renderPreview));
$("addItemBtn").addEventListener("click", () => {
  items.push({
    name: "",
    hsn: "",
    qty: 1,
    unit: "pcs",
    rate: 0,
    discount: 0,
    gst: 18,
  });
  renderItems();
  renderPreview();
});
$("businessLogo").addEventListener("change", (e) => {
  let f = e.target.files[0];
  if (f) {
    let r = new FileReader();
    r.onload = () => {
      logoData = r.result;
      renderPreview();
    };
    r.readAsDataURL(f);
  }
});
$("saveBtn").addEventListener("click", () => {
  localStorage.setItem("myBillDraft", JSON.stringify(state()));
  toast("Bill saved locally");
});
$("savedBillsBtn").addEventListener("click", () => {
  let s = localStorage.getItem("myBillDraft");
  s
    ? (apply(JSON.parse(s)), toast("Saved bill loaded"))
    : toast("No saved bill found");
});
$("newBillBtn").addEventListener("click", () => {
  if (confirm("Start a new bill? Current unsaved details will be cleared."))
    reset();
});
$("clearBtn").addEventListener("click", () => {
  if (confirm("Clear all bill details? This cannot be undone.")) reset();
});
$("printBtn").addEventListener("click", () => {
  if (valid()) window.print();
});
$("downloadBtn").addEventListener("click", async () => {
  if (!valid()) return;
  if (window.html2pdf) {
    toast("Preparing your PDF...");
    await window
      .html2pdf()
      .set({
        margin: 0,
        filename: `${val("invoiceNumber") || "invoice"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css"] },
      })
      .from($("invoicePreview"))
      .save();
  } else {
    toast("PDF library unavailable. Use Print to save as PDF.");
    window.print();
  }
});
reset();
