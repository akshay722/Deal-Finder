const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/getDeals", async (req, res) => {
  const { product } = req.body;
  const deals = [];

  // Amazon
  const amazonDeal = await fetchAmazonDeal(product);
  if (amazonDeal) deals.push(amazonDeal);

  // Best Buy
  const bestBuyDeal = await fetchBestBuyDeal(product);
  if (bestBuyDeal) deals.push(bestBuyDeal);

  // Target
  const targetDeal = await fetchTargetDeal(product);
  if (targetDeal) deals.push(targetDeal);

  res.json(deals);
});

async function fetchAmazonDeal(product) {
  try {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(product)}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const price = $(".a-price-whole").first().text();
    const link = $("a.a-link-normal").first().attr("href");

    return {
      site: "Amazon",
      price: parseFloat(price.replace(",", "") || "0"),
      url: `https://www.amazon.com${link}`,
    };
  } catch (error) {
    console.error("Error fetching Amazon deal:", error);
    return null;
  }
}

async function fetchBestBuyDeal(product) {
  try {
    const url = `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(
      product
    )}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const price = $(".priceView-customer-price span").first().text();
    const link = $(".sku-header a").first().attr("href");

    return {
      site: "Best Buy",
      price: parseFloat(price.replace("$", "") || "0"),
      url: `https://www.bestbuy.com${link}`,
    };
  } catch (error) {
    console.error("Error fetching Best Buy deal:", error);
    return null;
  }
}

async function fetchTargetDeal(product) {
  try {
    const url = `https://www.target.com/s?searchTerm=${encodeURIComponent(
      product
    )}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const price = $(".h-sr-only")
      .first()
      .text()
      .match(/\d+\.?\d*/)[0];
    const link = $('a[href*="/p/"]').first().attr("href");

    return {
      site: "Target",
      price: parseFloat(price || "0"),
      url: `https://www.target.com${link}`,
    };
  } catch (error) {
    console.error("Error fetching Target deal:", error);
    return null;
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
