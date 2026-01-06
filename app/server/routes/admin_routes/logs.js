import { Router } from "express";
import RecordModal from "../../../utils/models/Records.js";

const logsRouter = Router();

logsRouter.get("/", async (req, res) => {
  try {
    const validLogsType = ["settings", "distribution", "discounts"];
    const logsType = req.query?.type
      ? validLogsType.indexOf(req.query.type) != -1
      : false;
    if (!logsType) {
      throw new Error("Logs type must be included");
    }
    const logs = await RecordModal.find({ type: req.query.type })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    res.status(200).json({
      ok: true,
      logs: [...logs],
    });
  } catch (err) {
    console.log("❌ Failed to retrieve logs reason -->" + err.message);
    res.status(400).json({
      ok: false,
    });
  }
});
export default logsRouter;
