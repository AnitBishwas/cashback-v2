const getCashbackSettingsLogs = async () => {
  try {
    const url = `/api/apps/logs?type=settings`;
    const request = await fetch(url);
    const response = await request.json();
    if (!response.ok) {
      throw new Error("Failed to get logs");
    }
    return response.logs;
  } catch (err) {
    throw new Error(
      "🕔 Failed to get cashback settings logs reason -->" + err.message
    );
  }
};
const getCashbackDiscountLogs = async () => {
  try {
    const url = `/api/apps/logs?type=discounts`;
    const request = await fetch(url);
    const response = await request.json();
    if (!response.ok) {
      throw new Error("Failed to get logs");
    }
    return response.logs;
  } catch (err) {
    throw new Error(
      "🕔 Failed to get cashback settings logs reason -->" + err.message
    );
  }
};
const getDistributionLogs = async () => {
  try {
    const url = `/api/apps/logs?type=distribution`;
    const request = await fetch(url);
    const response = await request.json();
    if (!response.ok) {
      throw new Error("Failed to get logs");
    }
    return response.logs;
  } catch (err) {
    throw new Error(
      "🕔 Failed to get cashback settings logs reason -->" + err.message
    );
  }
};
export {
  getCashbackSettingsLogs,
  getCashbackDiscountLogs,
  getDistributionLogs,
};
