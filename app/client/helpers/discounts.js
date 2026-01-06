/**
 * @param {Object} payload - Coupon details
 * @property {string} title - Coupon title
 * @property {"active"|"draft"} status - Current coupon status
 * @property {"percentage"|"fixed"} type - Percentage-based or fixed-amount discount
 * @property {number} value - Discount value (0–100 for percentage, currency value for fixed)
 * @property {boolean} orderAboveApplication - Apply coupon only if order meets minimum value
 */

const createCashbackDiscount = async (payload) => {
  try {
    const url = `/api/apps/discounts/create`;
    const request = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await request.json();
    if (!data.ok) {
      throw new Error("Failed to create discount");
    }
    return data;
  } catch (err) {
    throw new Error(
      "Failed to create cashback discount reason -->" + err.message
    );
  }
};
const updateCashbackDiscount = async (id, payload) => {
  try {
    const url = `/api/apps/discounts/update`;
    const request = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        ...payload,
      }),
    });
    const data = await request.json();
    if (!data.ok) {
      throw new Error("Failed to update discount");
    }
  } catch (err) {
    throw new Error(
      "Failed to update cashback discount reason -->" + err.message
    );
  }
};
const getCashbackDiscounts = async () => {
  try {
    const url = `/api/apps/discounts/`;
    const request = await fetch(url);
    const data = await request.json();
    if (!data.ok) {
      throw new Error("Failed to get cashback discounts");
    }
    return data;
  } catch (err) {
    throw new Error("Failed to get discounts reason -->" + err.message);
  }
};

const getCashbackDiscount = async (id) => {
  try {
    const url = `/api/apps/discounts/${id}`;
    const request = await fetch(url);
    const data = await request.json();
    if (!data.ok) {
      throw new Error("Failed to get discount");
    }
    return data;
  } catch (err) {
    throw new Error("Failed to get cashback discount reason -->" + err.message);
  }
};

const deleteCashbackDiscount = async (id) => {
  try {
    const url = `/api/apps/discounts/delete`;
    const request = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    const data = await request.json();
    if (!data.ok) {
      throw new Error("Failed to delete");
    }
  } catch (err) {
    throw new Error("Failed to delete discount reason -->" + err.message);
  }
};
export {
  createCashbackDiscount,
  getCashbackDiscounts,
  getCashbackDiscount,
  deleteCashbackDiscount,
  updateCashbackDiscount,
};
