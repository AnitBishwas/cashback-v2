// components/PointsList.jsx
import {
  Card,
  Text,
  IndexTable,
  Badge,
  Pagination,
  Spinner,
  InlineStack,
  InlineGrid,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getCustomerWalletPoints } from "../../helpers/customerWallet.js";

const PointsList = ({ customerId, pageSize = 20 }) => {
  const shopify = useAppBridge();

  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const formatDate = useCallback((d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, []);

  const statusBadge = useCallback((status) => {
    const s = String(status || "").toLowerCase();
    if (s === "ready") return <Badge progress="complete">Ready</Badge>;
    if (s === "pending")
      return <Badge progress="partiallyComplete">Pending</Badge>;
    if (s === "expired") return <Badge progress="incomplete">Expired</Badge>;
    if (s === "cancelled") return <Badge>Cancelled</Badge>;
    return <Badge>{status || "-"}</Badge>;
  }, []);

  const ordersSummary = useCallback((orders) => {
    if (!Array.isArray(orders) || orders.length === 0) return "-";
    const credit = orders
      .filter((o) => o?.type === "credit")
      .reduce((sum, o) => sum + Number(o?.amount || 0), 0);
    const debit = orders
      .filter((o) => o?.type === "debit")
      .reduce((sum, o) => sum + Number(o?.amount || 0), 0);
    return `Credits: ${credit} | Debits: ${debit} | Orders: ${orders.length}`;
  }, []);

  const fetchPoints = useCallback(
    async (pageToLoad) => {
      if (!customerId) return;
      setLoading(true);
      try {
        const data = await getCustomerWalletPoints(customerId, {
          page: pageToLoad,
          limit: pageSize,
        });
        console.log(data);
        setPoints(data.points || []);
        setPage(data.page || pageToLoad);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.log("Failed to load points");
        shopify.toast.show("Failed to load points", { isError: true });
        setPoints([]);
        setPage(1);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [customerId, pageSize, shopify]
  );

  useEffect(() => {
    setPage(1);
    fetchPoints(1);
  }, [customerId, fetchPoints]);

  const rowMarkup = useMemo(() => {
    return points.map((p, index) => (
      <IndexTable.Row
        id={String(p._id || p.id)}
        key={String(p._id || p.id)}
        position={index}
        selectable={false}
      >
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {Number(p.amount || 0)}
          </Text>
        </IndexTable.Cell>

        <IndexTable.Cell>{statusBadge(p.status)}</IndexTable.Cell>

        <IndexTable.Cell>{formatDate(p.expiresOn)}</IndexTable.Cell>

        <IndexTable.Cell>{formatDate(p.createdAt)}</IndexTable.Cell>
      </IndexTable.Row>
    ));
  }, [points, statusBadge, formatDate, ordersSummary]);

  return (
    <Card padding={0}>
      <div
        style={{
          padding: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <InlineGrid columns={2}>
          <Text variant="headingMd" as="h2">
            Points
          </Text>
          {loading ? (
            <Spinner size="small" accessibilityLabel="Loading points" />
          ) : null}
        </InlineGrid>
      </div>

      <IndexTable
        selectable={false}
        resourceName={{ singular: "point", plural: "points" }}
        itemCount={points.length}
        headings={[
          { title: "Amount" },
          { title: "Status" },
          { title: "Expires on" },
          { title: "Created" },
        ]}
      >
        {rowMarkup}
      </IndexTable>

      <div style={{ padding: 16, display: "flex", justifyContent: "flex-end" }}>
        <Pagination
          hasPrevious={page > 1}
          onPrevious={() => fetchPoints(Math.max(1, page - 1))}
          hasNext={page < totalPages}
          onNext={() => fetchPoints(Math.min(totalPages, page + 1))}
        />
      </div>
    </Card>
  );
};

export default PointsList;
