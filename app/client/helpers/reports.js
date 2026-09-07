const generateReport = async (payload) => {
  try {
    const url = `/api/apps/reports/generate`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
    const req = await fetch(url, options);
    const res = await req.json();
    if (!res.ok) {
      throw new Error("Failed to request report");
    }
  } catch (err) {
    throw new Error("Failed to generate report reason -->" + err.message);
  }
};
const getReports = async ({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => {
  try {
    const params = new URLSearchParams({ page, limit, sortBy, sortOrder });
    const req = await fetch(`/api/apps/reports?${params}`);
    const res = await req.json();
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.data;
  } catch (err) {
    throw new Error("Failed to get reports reason -->" + err.message);
  }
};

const abortReport = async (reportId) => {
  try {
    const req = await fetch(`/api/apps/reports/abort/${reportId}`, {
      method: "PATCH",
    });
    const res = await req.json();
    if (!res.ok) throw new Error("Failed to abort report");
    return res.data;
  } catch (err) {
    throw new Error("Failed to abort report reason -->" + err.message);
  }
};

export default generateReport;
export { getReports, abortReport };
