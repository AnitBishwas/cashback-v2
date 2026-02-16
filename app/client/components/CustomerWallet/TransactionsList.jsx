import {
  Card,
  Text,
  IndexTable,
  Badge,
  Pagination,
  Spinner,
  TextField,
  InlineStack,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getCustomerWalletTransactions } from "../../helpers/customerWallet.js";

const TransactionsList = ({ walletId, pageSize = 10 }) => {
  const shopify = useAppBridge();

  const [loading, setLoading] = useState(false);

  const [queryValue, setQueryValue] = useState("");
  const [transactions, setTransactions] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleQueryChange = useCallback((value) => {
    setQueryValue(value);
    setPage(1);
  }, []);

  const statusBadge = useCallback((status) => {
    const s = String(status || "").toLowerCase();
    if (s === "completed") return <Badge progress="complete">Completed</Badge>;
    if (s === "pending")
      return <Badge progress="partiallyComplete">Pending</Badge>;
    if (s === "cancelled") return <Badge>Cancelled</Badge>;
    if (s === "expired") return <Badge progress="incomplete">Expired</Badge>;
    return <Badge>{status || "-"}</Badge>;
  }, []);

  const typeBadge = useCallback((type) => {
    const t = String(type || "").toLowerCase();
    if (t === "credit") return <Badge progress="complete">Credit</Badge>;
    if (t === "debit") return <Badge progress="incomplete">Debit</Badge>;
    return <Badge>{type || "-"}</Badge>;
  }, []);

  const formatDate = useCallback((d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, []);

  const fetchTransactions = useCallback(
    async (pageToLoad, searchValue) => {
      if (!walletId) return;
      setLoading(true);
      try {
        const data = await getCustomerWalletTransactions(walletId, {
          query: searchValue || "",
          page: pageToLoad,
          limit: pageSize,
        });

        setTransactions(data.transactions || []);
        setPage(data.page || pageToLoad);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.log("Failed to load transactions");
        shopify.toast.show("Failed to load transactions", { isError: true });
        setTransactions([]);
        setPage(1);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [walletId, pageSize, shopify]
  );

  useEffect(() => {
    setPage(1);
    setQueryValue("");
    fetchTransactions(1, "");
  }, [walletId, fetchTransactions]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchTransactions(1, queryValue);
    }, 400);
    return () => clearTimeout(t);
  }, [queryValue, fetchTransactions]);

  const rowMarkup = useMemo(() => {
    return transactions.map((tx, index) => (
      <IndexTable.Row
        id={String(tx._id || tx.id)}
        key={String(tx._id || tx.id)}
        position={index}
        selectable={false}
      >
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {tx.orderName || (tx.orderId ? `#${tx.orderId}` : "-")}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text as="span" tone="subdued" variant="bodySm">
              {tx.orderId ? `Order ID: ${tx.orderId}` : "Order ID: -"}
            </Text>
          </div>
        </IndexTable.Cell>

        <IndexTable.Cell>{typeBadge(tx.type)}</IndexTable.Cell>
        <IndexTable.Cell>{statusBadge(tx.status)}</IndexTable.Cell>

        <IndexTable.Cell>
          <Text as="span" alignment="end">
            {Number(tx.amount || 0)}
          </Text>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <Text as="span" alignment="end">
            {Number(tx.closingBalance || 0)}
          </Text>
        </IndexTable.Cell>

        <IndexTable.Cell>{formatDate(tx.createdAt)}</IndexTable.Cell>
      </IndexTable.Row>
    ));
  }, [transactions, typeBadge, statusBadge, formatDate]);

  return (
    <Card padding={0}>
      <div style={{ padding: 16 }}>
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingMd" as="h2">
            Transactions
          </Text>
          {loading ? (
            <Spinner size="small" accessibilityLabel="Loading transactions" />
          ) : null}
        </InlineStack>

        <div style={{ marginTop: 12 }}>
          <TextField
            label="Search transactions"
            labelHidden
            value={queryValue}
            onChange={handleQueryChange}
            placeholder="Search by order name or order id"
            clearButton
            onClearButtonClick={() => setQueryValue("")}
            autoComplete="off"
          />
        </div>
      </div>

      <IndexTable
        selectable={false}
        resourceName={{ singular: "transaction", plural: "transactions" }}
        itemCount={transactions.length}
        headings={[
          { title: "Order" },
          { title: "Type" },
          { title: "Status" },
          { title: "Amount", alignment: "end" },
          { title: "Closing balance", alignment: "end" },
          { title: "Date" },
        ]}
      >
        {rowMarkup}
      </IndexTable>

      <div style={{ padding: 16, display: "flex", justifyContent: "flex-end" }}>
        <Pagination
          hasPrevious={page > 1}
          onPrevious={() =>
            fetchTransactions(Math.max(1, page - 1), queryValue)
          }
          hasNext={page < totalPages}
          onNext={() =>
            fetchTransactions(Math.min(totalPages, page + 1), queryValue)
          }
        />
      </div>
    </Card>
  );
};

export default TransactionsList;
