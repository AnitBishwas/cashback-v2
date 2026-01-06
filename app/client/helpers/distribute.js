const distributeCashback = async (payload) => {
  try {
    const url = `/api/apps/distribution`;
    const request = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await request.json();
    if (!data.ok) {
      throw new Error("Failed");
    }
    return data;
  } catch (err) {
    throw new Error("Failed to distribute cashback reason -->" + err.message);
  }
};
export { distributeCashback };
