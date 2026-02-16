const getCutomerWallet = async (query) => {
  try {
    const url = `/api/apps/customerWallet?query=${query}`;
    const req = await fetch(url);
    const data = await req.json();
    if (!data.ok) {
      throw new Error("Failed to get customer");
    }
    return data.data;
  } catch (err) {
    throw new Error("Failed to get customer reason -->" + err.message);
  }
};
const getCustomerWalletSummary = async (customerId) => {
  try {
    const url = `/api/apps/customerWallet/${customerId}/wallet`;
    const req = await fetch(url);
    const data = await req.json();
    if (!data.ok) {
      throw new Error("Failed to get customer wallet summary");
    }
    return data;
  } catch (err) {
    throw new Error(
      "Failed to get customer specific wallet dara reason -->" + err.message
    );
  }
};
const getCustomerWalletPoints = async (
  customerId,
  { page = 1, limit = 10 } = {}
) => {
  try {
    const url = `/api/apps/customerWallet/${customerId}/points?page=${page}&limit=${limit}`;
    const req = await fetch(url);
    const data = await req.json();

    if (!data.ok) {
      throw new Error("Failed to get customer wallet points");
    }
    return data; // expected: { ok:true, items, total, page, limit, totalPages }
  } catch (err) {
    throw new Error(
      "Failed to get customer wallet points data reason -->" + err.message
    );
  }
};

const getCustomerWalletTransactions = async (
  walletId,
  { query = "", page = 1, limit = 10 } = {}
) => {
  try {
    const url = `/api/apps/customerWallet/${walletId}/transactions?query=${encodeURIComponent(
      query || ""
    )}&page=${page}&limit=${limit}`;

    const req = await fetch(url);
    const data = await req.json();

    if (!data.ok) {
      throw new Error("Failed to get customer wallet transactions");
    }
    return data;
  } catch (err) {
    throw new Error(
      "Failed to get customer wallet transactions data reason -->" + err.message
    );
  }
};

const updateCustomerPhone = async (customerId, phone) => {
  try {
    const url = `/api/apps/customerWallet/${customerId}/phone`;
    const req = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    const data = await req.json();

    if (!data.ok) {
      throw new Error(data.message || "Failed to update customer phone");
    }

    return data; // { ok:true, customerId, phone }
  } catch (err) {
    throw new Error(
      "Failed to update customer phone reason --> " + err.message
    );
  }
};
export {
  getCutomerWallet,
  getCustomerWalletSummary,
  getCustomerWalletPoints,
  getCustomerWalletTransactions,
  updateCustomerPhone,
};
