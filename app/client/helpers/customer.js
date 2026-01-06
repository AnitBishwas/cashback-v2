const getCutomer = async (query) => {
  try {
    const url = `/api/apps/customer?query=${query}`;
    const req = await fetch(url);
    const data = await req.json();
    if (!data.ok) {
      throw new Error("Failed to get customer");
    }
    return data;
  } catch (err) {
    throw new Error("Failed to get customer reason -->" + err.message);
  }
};
export { getCutomer };
