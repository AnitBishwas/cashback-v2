import { Router } from "express";
import reportValidationSchema from "../../validators/Reports.js";
import {
  queueReportRequest,
  retrieveQueuedReports,
  abortReport,
} from "../../controllers/report.js";

const reportRoutes = Router();

reportRoutes.post("/generate", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) {
      throw new Error("Payload missing");
    }
    const isPayloadvalid = reportValidationSchema.validate(payload);
    if (!isPayloadvalid) {
      throw new Error("Invalid params provided");
    }
    const requestedUser =
      res.locals.user_session.onlineAccessInfo.associated_user;
    const userDetails = {
      email: requestedUser.email,
      name: requestedUser.first_name + requestedUser.last_name,
    };
    const report = await queueReportRequest({
      ...isPayloadvalid.value,
      user: userDetails,
    });
    res.status(200).json({
      ok: true,
      data: report,
    });
  } catch (err) {
    console.log("failed to generate report reason -->" + err.message);
    res.status(420).json({
      ok: false,
    });
  }
});

reportRoutes.patch("/abort/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const report = await abortReport(id);
    res.status(200).json({ ok: true, data: report });
  } catch (err) {
    console.log("failed to abort report reason -->" + err.message);
    res.status(400).json({ ok: false });
  }
});

reportRoutes.get("/", async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const result = await retrieveQueuedReports({
      page,
      limit,
      sortBy,
      sortOrder,
    });
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    console.log("failed to retrieve reports reason -->" + err.message);
    res.status(400).json({ ok: false });
  }
});

export default reportRoutes;
