
const form = document.getElementById("converter-form");
const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("from-currency");
const toCurrency = document.getElementById("to-currency");
const swapButton = document.getElementById("swap-btn");
const convertButton = document.getElementById("convert-btn");
const resultElement = document.getElementById("result");
const rateElement = document.getElementById("exchange-rate");
const statusElement = document.getElementById("status");

// Format an amount according to its currency.
function formatCurrency(amount, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 4
  }).format(amount);
}

// Convert currency using the Frankfurter API.
async function convertCurrency(event) {
  if (event) {
    event.preventDefault();
  }

  const amount = Number(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  // Validate the entered amount.
  if (
    amountInput.value.trim() === "" ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    statusElement.textContent =
      "Please enter a valid amount (zero or greater).";
    resultElement.textContent = "--";
    rateElement.textContent = "Check your entered amount.";
    return;
  }

  statusElement.textContent = "";
  convertButton.disabled = true;
  convertButton.querySelector("span").textContent = "Converting...";

  resultElement.textContent = "--";
  rateElement.textContent = "Fetching exchange rate...";

  try {
    let rate;

    // No API request is needed for the same currency.
    if (from === to) {
      rate = 1;
    } else {
      const url =
        `https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Exchange rate service is unavailable.");
      }

      const data = await response.json();
      rate = data.rates?.[to];

      if (typeof rate !== "number" || !Number.isFinite(rate)) {
        throw new Error("Exchange rate could not be found.");
      }
    }

    const convertedAmount = amount * rate;

    resultElement.textContent = formatCurrency(
      convertedAmount,
      to
    );

    rateElement.textContent =
      `1 ${from} = ${rate.toLocaleString("en-US", {
        maximumFractionDigits: 6
      })} ${to}`;

    statusElement.textContent = "Conversion completed successfully.";
  } catch (error) {
    console.error("Currency conversion error:", error);

    resultElement.textContent = "--";
    rateElement.textContent =
      "Unable to retrieve the exchange rate.";

    statusElement.textContent =
      "Please check your internet connection and try again.";
  } finally {
    convertButton.disabled = false;
    convertButton.querySelector("span").textContent =
      "Convert Currency";
  }
}

// Swap the selected currencies.
swapButton.addEventListener("click", () => {
  const previousFrom = fromCurrency.value;

  fromCurrency.value = toCurrency.value;
  toCurrency.value = previousFrom;

  convertCurrency();
});

// Convert when the form is submitted.
form.addEventListener("submit", convertCurrency);

// Update the result when either currency changes.
fromCurrency.addEventListener("change", convertCurrency);
toCurrency.addEventListener("change", convertCurrency);

// Show a fresh conversion when the amount changes.
amountInput.addEventListener("input", () => {
  if (amountInput.value.trim() !== "") {
    convertCurrency();
  }
});

// Show the initial conversion when the page opens.
convertCurrency();
