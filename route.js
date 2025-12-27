let routes = [];
let selectedRoute = null;

const fuelLimits = {
  car: { petrol:[90,110], diesel:[85,100], cng:[70,100] },
  bike:{ petrol:[90,110] }
};

const mileageLimits = {
  car: { petrol:[8,20], diesel:[10,25], cng:[12,30], ev:[4,8] },
  bike:{ petrol:[30,70], ev:[20,50] }
};

fetch("https://cdn.jsdelivr.net/gh/yatrat/fuel@v2.1/route.js")
  .then(r => r.json())
  .then(d => routes = d.routes);

const input = document.getElementById("cityInput");
const box = document.getElementById("suggestions");
const errorBox = document.getElementById("error");
const vehicle = document.getElementById("vehicle");
const fuel = document.getElementById("fuel");
const priceInput = document.getElementById("price");
const mileageInput = document.getElementById("mileage");
const result = document.getElementById("result");

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

vehicle.addEventListener("change", e => {
  [...fuel.options].forEach(o => o.disabled = false);
  if (e.target.value === "bike") {
    fuel.value = "";
    fuel.querySelector('[value="diesel"]').disabled = true;
    fuel.querySelector('[value="cng"]').disabled = true;
  }
});

fuel.addEventListener("change", e => {
  if (e.target.value === "ev") {
    priceInput.disabled = true;
    priceInput.value = "";
    priceInput.placeholder = "Not required for EV";
  } else {
    priceInput.disabled = false;
    priceInput.placeholder = "Fuel rate (₹)";
  }
});

document.getElementById("calcBtn").addEventListener("click", () => {
  errorBox.innerText = "";
  result.innerHTML = "";

  if (!selectedRoute) return errorBox.innerText = "Please select a route first";

  const v = vehicle.value;
  const f = fuel.value;
  const price = +priceInput.value;
  const mileage = +mileageInput.value;

  if (!v || !f || (!price && f !== "ev") || !mileage)
    return errorBox.innerText = "Please fill all required fields";

  if (f !== "ev") {
    const [min,max] = fuelLimits[v][f];
    if (price < min || price > max)
      return errorBox.innerText = `Please enter fuel rate between ${min} and ${max}`;
  }

  const [mMin, mMax] = mileageLimits[v][f];
  if (mileage < mMin || mileage > mMax)
    return errorBox.innerText = `Please enter mileage between ${mMin} and ${mMax}`;

  const dist = selectedRoute.distance;
  const fuelUsed = dist / mileage;

  const range = v => [v*0.95, v*1.05];
  const pr = f === "ev" ? null : range(fuelUsed * price);
  const dr = range(dist);
  const fr = range(fuelUsed);
  const tr = range(dist / 70);

  result.innerHTML = `
    <b>${selectedRoute.from} → ${selectedRoute.to}</b><br>
    Price: ${pr ? `₹${pr[0].toFixed(0)} – ₹${pr[1].toFixed(0)}` : "N/A"}<br>
    Distance: ${dr[0].toFixed(0)} – ${dr[1].toFixed(0)} km<br>
    Fuel: ${fr[0].toFixed(1)} – ${fr[1].toFixed(1)} units<br>
    Time: ${tr[0].toFixed(1)} – ${tr[1].toFixed(1)} hrs<br>
    <small>* Prices and distances may vary. Toll taxes not included.</small>
  `;
});
