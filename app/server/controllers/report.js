import ReportModel from "@swiss-beauty/cashback-schema/src/models/Report.model.js";
import sendMessageToSQS from "../controllers/aws.js";

const queueReportRequest = async (payload) => {
  let createdReport = null;
  try {
    payload["status"] = "requested";
    const report = (await ReportModel.create(payload)).toObject();
    if (!report) {
      throw new Error("Failed to create report");
    }
    createdReport = report;
    await sendMessageToSQS({
      topic: "CASHBACK_REPORT",
      ...report,
    });
    return report;
  } catch (err) {
    if (createdReport) {
      await ReportModel.findByIdAndUpdate(createdReport._id, {
        error: { message: err.message },
        status: "failed",
      }).catch(() => {});
    }
    throw new Error("Failed to queue report request reason -->" + err.message);
  }
};

const SORTABLE_FIELDS = ["createdAt", "updatedAt", "status", "type"];

const retrieveQueuedReports = async ({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => {
  try {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (safePage - 1) * safeLimit;
    const safeSortBy = SORTABLE_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;

    const [reports, total] = await Promise.all([
      ReportModel.find()
        .sort({ [safeSortBy]: safeSortOrder })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      ReportModel.countDocuments(),
    ]);

    return {
      reports,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  } catch (err) {
    throw new Error(
      "Failed to retrieve queued reports reason -->" + err.message
    );
  }
};

const abortReport = async (reportId) => {
  try {
    const report = await ReportModel.findOneAndUpdate(
      { _id: reportId, status: { $in: ["progress", "requested"] } },
      { status: "aborted" },
      { new: true }
    ).lean();
    if (!report) throw new Error("Report not found or cannot be aborted");
    return report;
  } catch (err) {
    throw new Error("Failed to abort report reason -->" + err.message);
  }
};

export { queueReportRequest, retrieveQueuedReports, abortReport };
