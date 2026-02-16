/**
 *
 * @param {String} cartId - Shopify cart id
 * @returns object - wallet data
 */
const createWallet = async (cartId) => {
  try {
    const url = `/apps/latest-proxy/cashback/wallet`;
    const request = await fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ cartId: cartId }),
    });
    const response = await request.json();
    if (!response.ok) {
      throw new Error("Failed to create wallet");
    }
    return response;
  } catch (err) {
    throw new Error("Failed to create wallet reason -->" + err.message);
  }
};

const getLandingPageData = async () => {
  try {
    console.log("making request here thisisisis -->")
    const url = `/apps/cashback-v2/landing`;
    const request = await fetch(url);
    const response = await request.json();
    if (!response.ok) {
      throw new Error("Failed to get landing page data");
    }
    return response;
  } catch (err) {
    throw new Error("Failed to get landing page data reason -->" + err.message);
  }
};
const formatDateLocal = (value) => {
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${new Date(value).getDate()} ${
    months[new Date(value).getMonth()]
  } ${new Date(value).getFullYear()}`;
};

const filterTransaction = async (query) => {
  try {
    const url = "/apps/cashback-v2/transactions" + query;
    const request = await fetch(url);
    const response = await request.json();
    if (!response.ok) {
      throw new Error("Failed to get transactions");
    }
    return response;
  } catch (err) {
    throw new Error("Failed to filter transactions");
  }
};
export { createWallet, getLandingPageData, formatDateLocal, filterTransaction };
