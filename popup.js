document.getElementById("findDeals").addEventListener("click", () => {
  console.log("Find Deals button clicked");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: findDeals,
      },
      (results) => {
        console.log("Script executed results:", results);
        if (results && results[0] && results[0].result) {
          console.log("Results from findDeals:", results[0].result);
          displayResults(results[0].result);
        } else {
          console.error("No results from findDeals");
        }
      }
    );
  });
});

function displayResults(deals) {
  console.log("Displaying results:", deals);
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  if (deals.length === 0) {
    resultsDiv.innerText = "No deals found.";
  } else {
    deals.forEach((deal) => {
      const link = document.createElement("a");
      link.href = deal.url;
      link.target = "_blank";
      link.className = "link";
      link.innerText = `${deal.site}: $${deal.price}`;
      resultsDiv.appendChild(link);
    });
  }
}

async function findDeals() {
  console.log("findDeals function executed");
  const productInfo = getProductInfo();
  console.log("Product Info:", productInfo);
  try {
    const response = await fetch("http://localhost:3000/getDeals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product: productInfo.name }),
    });

    if (!response.ok) {
      console.error("Error fetching deals:", response.statusText);
      return [];
    }

    const deals = await response.json();
    console.log("Deals from backend:", deals);
    return deals.filter((deal) => deal.price < productInfo.price);
  } catch (error) {
    console.error("Error in findDeals function:", error);
    return [];
  }
}

function getProductInfo() {
  const priceElement = document.querySelector(".price");
  const price = priceElement
    ? parseFloat(priceElement.innerText.replace("$", ""))
    : 0;
  return {
    name: document.title,
    price: price,
  };
}
