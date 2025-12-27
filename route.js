let routes = [];
let selectedRoute = null;

const fuelLimits = {
  car: { petrol:[90,110], diesel:[85,100], cng:[70,100] },
  bike:{ petrol:[90,110] }
};

fetch("https://cdn.jsdelivr.net/gh/yatrat/fuel@v2/route.json")
  .then(r => r.json())
  .then(d => routes = d.routes);

const input = document.getElementById("cityInput");
const box = document.getElementById("suggestions");

input.addEventListener("input", () => {
  const q = input.value.trim().toLowerCase();
  box.innerHTML = "";

  if (!q) return box.style.display = "none";

  routes.filter(r => r.from.toLowerCase().startsWith(q))
    .forEach(r => {
      const d = document.createElement("div");
      d.textContent = `${r.from} → ${r.to} (${r.distance} km)`;
      d.onclick = () => {
        selectedRoute = r;
        input.value = r.from;
        box.style.display = "none";
      };
      box.appendChild(d);
    });

  box.style.display = "block";
});

document.getElementById("vehicle").addEventListener("change", e => {
  const fuel = document.getElementById("fuel");
  [...fuel.options].forEach(o => o.disabled = false);
  if (e.target.value === "bike") {
    fuel.value = "";
    fuel.querySelector('[value="diesel"]').disabled = true;
    fuel.querySelector('[value="cng"]').disabled = true;
  }
});

document.getElementById("fuel").addEventListener("change", e => {
  const p = document.getElementById("price");
  if (e.target.value === "ev") {
    p.disabled = true;
    p.value = "";
    p.placeholder = "Not required for EV";
  } else {
    p.disabled = false;
    p.placeholder = "Fuel rate (₹)";
  }
});

document.getElementById("calcBtn").onclick = () => {
  if (!selectedRoute) return alert("Select route");

  const v = vehicle.value;
  const f = fuel.value;
  const price = +priceInput.value;
  const mileage = +mileageInput.value;

  if (!v || !f || (!price && f !== "ev") || !mileage) return alert("All fields required");

  if (f !== "ev") {
    const [min,max] = fuelLimits[v][f] || [];
    if (price < min || price > max) return alert(`Rate must be ${min}–${max}`);
  }

  const dist = selectedRoute.distance;
  const fuelUsed = dist / mileage;

  const r = p => [p*0.95, p*1.05];
  const pr = f === "ev" ? null : r(fuelUsed*price);
  const dr = r(dist);
  const fr = r(fuelUsed);
  const tr = r(dist/70);

  result.innerHTML = `
    <b>${selectedRoute.from} → ${selectedRoute.to}</b><br>
    Price: ${pr ? `₹${pr[0].toFixed(0)} – ₹${pr[1].toFixed(0)}` : "N/A"}<br>
    Distance: ${dr[0].toFixed(0)} – ${dr[1].toFixed(0)} km<br>
    Fuel: ${fr[0].toFixed(1)} – ${fr[1].toFixed(1)} units<br>
    Time: ${tr[0].toFixed(1)} – ${tr[1].toFixed(1)} hrs<br>
    <small>* Prices and distances may vary. Toll taxes not included.</small>
  `;
};
