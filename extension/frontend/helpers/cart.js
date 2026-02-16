/**
 * Get Shopifyn Cart Data
 * @returns object - CartData
 */
const getCartData = async () => {
  try {
    const url = window.Shopify.routes.root + "cart.js";
    const request = await fetch(url);
    const data = await request.json();
    let id = data.token;
    return {
      id,
      ...data,
    };
  } catch (err) {
    throw new Error("Failed to get shopify cart reason -->" + err.message);
  }
};
export { getCartData };
