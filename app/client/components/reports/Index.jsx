import {
  Card,
  Text,
  IndexTable,
  Badge,
  Pagination,
  Spinner,
  Button,
  Popover,
  ActionList,
} from "@shopify/polaris";
import { MenuVerticalIcon, RefreshIcon } from "@shopify/polaris-icons";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getReports, abortReport } from "../../helpers/reports.js";

// columns: 0=Report ID, 1=Requested by, 2=Date Range, 3=Status, 4=Created, 5=Actions
const SORT_COLUMNS = {
  3: "status",
  4: "createdAt",
};

const statusBadge = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "success":
      return <Badge tone="success">Success</Badge>;
    case "failed":
      return <Badge tone="critical">Failed</Badge>;
    case "aborted":
      return <Badge tone="warning">Aborted</Badge>;
    case "progress":
      return (
        <Badge tone="info" progress="partiallyComplete">
          In Progress
        </Badge>
      );
    case "requested":
      return (
        <Badge tone="attention" progress="incomplete">
          Requested
        </Badge>
      );
    default:
      return <Badge>{status || "-"}</Badge>;
  }
};

const formatDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatDateOnly = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-IN", { dateStyle: "medium" });
};

const ReportsList = ({ pageSize = 2 }) => {
  const shopify = useAppBridge();

  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortColumnIndex, setSortColumnIndex] = useState(4);
  const [sortDirection, setSortDirection] = useState("descending");
  const [abortingId, setAbortingId] = useState(null);
  const [activePopoverId, setActivePopoverId] = useState(null);

  const fetchReports = useCallback(
    async (pageToLoad, colIndex, direction) => {
      setLoading(true);
      try {
        const sortBy = SORT_COLUMNS[colIndex] || "createdAt";
        const sortOrder = direction === "ascending" ? "asc" : "desc";
        const data = await getReports({
          page: pageToLoad,
          limit: pageSize,
          sortBy,
          sortOrder,
        });
        setReports(data.reports || []);
        setPage(data.page || pageToLoad);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        shopify.toast.show("Failed to load reports", { isError: true });
        setReports([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, shopify]
  );

  useEffect(() => {
    fetchReports(1, 4, "descending");
  }, [fetchReports]);

  const handleSort = useCallback(
    (index, direction) => {
      setSortColumnIndex(index);
      setSortDirection(direction);
      fetchReports(1, index, direction);
    },
    [fetchReports]
  );

  const togglePopover = useCallback((id) => {
    setActivePopoverId((prev) => (prev === id ? null : id));
  }, []);

  const closePopover = useCallback(() => setActivePopoverId(null), []);

  const handleAbort = useCallback(
    async (reportId) => {
      setAbortingId(reportId);
      try {
        await abortReport(reportId);
        shopify.toast.show("Report aborted");
        fetchReports(page, sortColumnIndex, sortDirection);
      } catch (err) {
        shopify.toast.show("Failed to abort report", { isError: true });
      } finally {
        setAbortingId(null);
      }
    },
    [shopify, fetchReports, page, sortColumnIndex, sortDirection]
  );

  
  const rowMarkup = useMemo(() => {
    return reports.map((report, index) => {
      const id = String(report._id);
      const canAbort = ["progress", "requested"].includes(report.status);
      const canDownload = report.status === "success" && Boolean(report.cdn);
      const isAborting = abortingId === id;

      return (
        <IndexTable.Row id={id} key={id} position={index} selectable={false}>
          <IndexTable.Cell>
            <Text as="span" variant="bodySm" tone="subdued">
              {id}
            </Text>
          </IndexTable.Cell>

          <IndexTable.Cell>
            <Text as="span" variant="bodyMd">
              {report.user?.email || "-"}
            </Text>
          </IndexTable.Cell>

          <IndexTable.Cell>
            <Text as="span" variant="bodySm">
              {formatDateOnly(report.dateRange?.start)} –{" "}
              {formatDateOnly(report.dateRange?.end)}
            </Text>
          </IndexTable.Cell>

          <IndexTable.Cell>{statusBadge(report.status)}</IndexTable.Cell>

          <IndexTable.Cell>{formatDate(report.createdAt)}</IndexTable.Cell>

          <IndexTable.Cell>
            <Popover
              active={activePopoverId === id}
              activator={
                <Button
                  icon={MenuVerticalIcon}
                  size="slim"
                  variant="plain"
                  accessibilityLabel="More actions"
                  onClick={() => togglePopover(id)}
                />
              }
              onClose={closePopover}
            >
              <ActionList
                items={[
                  {
                    content: "Download",
                    disabled: !canDownload,
                    onAction: () => {
                      window.open(report.cdn, "_blank");
                      closePopover();
                    },
                  },
                  {
                    content: isAborting ? "Aborting..." : "Abort",
                    destructive: true,
                    disabled: !canAbort || isAborting,
                    onAction: () => {
                      handleAbort(id);
                      closePopover();
                    },
                  },
                ]}
              />
            </Popover>
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    });
  }, [
    reports,
    abortingId,
    activePopoverId,
    handleAbort,
    togglePopover,
    closePopover,
  ]);

  return (
    <Card padding={0}>
      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text variant="headingMd" as="h2">
            Reports
          </Text>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {loading ? (
              <Spinner size="small" accessibilityLabel="Loading reports" />
            ) : null}
            <Button
              icon={RefreshIcon}
              size="slim"
              variant="plain"
              accessibilityLabel="Refresh reports"
              disabled={loading}
              onClick={() => fetchReports(page, sortColumnIndex, sortDirection)}
            />
          </div>
        </div>
      </div>

      <IndexTable
        selectable={false}
        resourceName={{ singular: "report", plural: "reports" }}
        itemCount={reports.length}
        sortable={[false, false, false, true, true, false]}
        sortColumnIndex={sortColumnIndex}
        sortDirection={sortDirection}
        onSort={handleSort}
        headings={[
          { title: "Report ID" },
          { title: "Requested by" },
          { title: "Date Range" },
          { title: "Status" },
          { title: "Created" },
          { title: "Actions" },
        ]}
      >
        {rowMarkup}
      </IndexTable>

      <div style={{ padding: 16, display: "flex", justifyContent: "flex-end" }}>
        <Pagination
          hasPrevious={page > 1}
          onPrevious={() =>
            fetchReports(Math.max(1, page - 1), sortColumnIndex, sortDirection)
          }
          hasNext={page < totalPages}
          onNext={() =>
            fetchReports(
              Math.min(totalPages, page + 1),
              sortColumnIndex,
              sortDirection
            )
          }
        />
      </div>
    </Card>
  );
};

export default ReportsList;
