const getCashbackSettings = async () => {
  try {
    const url = `/api/apps/settings`;
    const request = await fetch(url);
    const data = await request.json();
    return data;
  } catch (err) {
    throw new Error("Failed to get casback settings reason -->" + err.message);
  }
};

const updateCashbackSettings = async (payload) => {
  try {
    const url = `/api/apps/settings/update`;
    const request = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const response = await request.json();
    console.log(response);
    return response;
  } catch (err) {
    throw new Error(
      "Failed to update cashback settings reason -->" + err.message
    );
  }
};
export { getCashbackSettings, updateCashbackSettings };
