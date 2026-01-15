const createStorefrontOffer = async (payload) => {
  try {
    const url = `/api/apps/storefront/offers/create`;
    const request = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const res = await request.json();
    if (!res.ok) {
      throw new Error("Failed to create storefront offer");
    }
    return res;
  } catch (err) {
    throw new Error(
      "Failed to create storefront offer reason -->" + err.message
    );
  }
};
const getStorefrontOffers = async () => {
  try {
    const url = `/api/apps/storefront/offers`;
    const req = await fetch(url);
    const res = await req.json();
    if (!res.ok) {
      throw new Error("Failed to get offers");
    }
    return res.offers;
  } catch (err) {
    throw new Error(
      "Failed to get storefront offers reason --->" + err.message
    );
  }
};

const deleteStorefrontOffer = async (id) => {
  try {
    const url = `/api/apps/storefront/offers/delete`;
    const req = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    const res = await req.json();
    if (!res.ok) {
      throw new Error("Failed to delete storefront offer");
    }
    return res;
  } catch (err) {
    throw new Error(
      "Failed to delete storefront offer reason -->" + err.message
    );
  }
};

const updateStorefrontOfferPosition = async (id, position) => {
  try {
    const url = `/api/apps/storefront/offers/updatePosition`;
    const req = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, position }),
    });
    const res = await req.json();
    if (!res.ok) {
      throw new Error("Failed to update position");
    }
    return res;
  } catch (err) {
    throw new Error(
      "Failed ton update offer position reason -->" + err.message
    );
  }
};
export {
  createStorefrontOffer,
  getStorefrontOffers,
  deleteStorefrontOffer,
  updateStorefrontOfferPosition,
};
