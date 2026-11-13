const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");

const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");

const result = document.getElementById("result");
const rateText = document.getElementById("rate");
const statusText = document.getElementById("status");

const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");

const currencies = {
    USD: "🇺🇸",
    INR: "🇮🇳",
    EUR: "🇪🇺",
    GBP: "🇬🇧",
    JPY: "🇯🇵",
    AUD: "🇦🇺",
    CAD: "🇨🇦",
    AED: "🇦🇪",
    SGD: "🇸🇬",
    CNY: "🇨🇳",
    CHF: "🇨🇭",
    NZD: "🇳🇿",
    KRW: "🇰🇷",
    THB: "🇹🇭",
    MYR: "🇲🇾",
    SAR: "🇸🇦",
    ZAR: "🇿🇦",
    BRL: "🇧🇷",
    BDT: "🇧🇩",
    NPR: "🇳🇵"
};

// Load available currencies
async function loadCurrencies() {
    try {
        const response = await fetch(
            "https://open.er-api.com/v6/latest/USD"
        );

        if (!response.ok) {
            throw new Error("Unable to load currencies");
        }

        const data = await response.json();

        if (data.result !== "success") {
            throw new Error("API unavailable");
        }

        const codes = Object.keys(data.rates).sort();

        [fromCurrency, toCurrency].forEach(select => {
            select.innerHTML = "";

            codes.forEach(code => {
                const option = document.createElement("option");
                option.value = code;
                option.textContent = code;
                select.appendChild(option);
            });
        });

        fromCurrency.value = "INR";
        toCurrency.value = "USD";

        updateFlags();
        convertCurrency();

    } catch (error) {
        statusText.textContent =
            "Unable to load currencies. Check your internet connection.";
    }
}

// Update country flags
function updateFlags() {
    fromFlag.textContent =
        currencies[fromCurrency.value] || "🌍";

    toFlag.textContent =
        currencies[toCurrency.value] || "🌍";
}

// Currency conversion
async function convertCurrency() {

    const amount = Number(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (!Number.isFinite(amount) || amount <= 0) {
        statusText.textContent =
            "Please enter a valid amount greater than zero.";
        return;
    }

    convertBtn.disabled = true;
    convertBtn.innerHTML = "Converting...";

    statusText.textContent =
        "Connecting to exchange rate service...";

    try {
        const response = await fetch(
            `https://open.er-api.com/v6/latest/${from}`
        );

        if (!response.ok) {
            throw new Error("Network error");
        }

        const data = await response.json();

        if (data.result !== "success" ||
            !data.rates[to]) {
            throw new Error("Exchange rate unavailable");
        }

        const exchangeRate = data.rates[to];
        const converted = amount * exchangeRate;

        const formatted = new Intl.NumberFormat(
            "en-US",
            {
                maximumFractionDigits: 2
            }
        ).format(converted);

        const formattedRate = new Intl.NumberFormat(
            "en-US",
            {
                maximumFractionDigits: 6
            }
        ).format(exchangeRate);

        result.textContent = `${to} ${formatted}`;

        rateText.textContent =
            `1 ${from} = ${formattedRate} ${to}`;

        statusText.textContent =
            `Last updated: ${data.time_last_update_utc}`;

    } catch (error) {
        result.textContent = "Conversion unavailable";
        rateText.textContent = "Please try again.";
        statusText.textContent =
            "Connection error. Check your internet.";
    } finally {
        convertBtn.disabled = false;
        convertBtn.innerHTML =
            'Convert Currency <span>→</span>';
    }
}

// Convert button
convertBtn.addEventListener("click", convertCurrency);

// Swap currencies
swapBtn.addEventListener("click", () => {

    const temp = fromCurrency.value;

    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;

    updateFlags();
    convertCurrency();
});

// Update flags when selection changes
fromCurrency.addEventListener("change", () => {
    updateFlags();
    convertCurrency();
});

toCurrency.addEventListener("change", () => {
    updateFlags();
    convertCurrency();
});

// Update when amount changes
amountInput.addEventListener("input", () => {
    if (amountInput.value > 0) {
        convertCurrency();
    }
});

// Start application
loadCurrencies();