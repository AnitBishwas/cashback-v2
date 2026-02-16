const eventHandler = async (eventName, params) => {
  try {
    let session_id = await getGaSessionId();
    const url = `/apps/latest-proxy/events`;
    const request = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName,
        session_id,
        params,
      }),
    });
    const response = await request.json();
  } catch (err) {
    console.log("Failed to add event reason -->" + err.message);
  }
};
const getGaSessionId = async () => {
  try {
    let session_id = null;
    let gaPromise = await new Promise((res, rej) => {
      gtag("get", "G-VN0WE6J114", "session_id", (val) => {
        session_id = val;
        res(true);
      });
    });
    return session_id;
  } catch (err) {
    throw new Error("Failed to get GA Session Id reason -->" + err.message);
  }
};
export { eventHandler };
