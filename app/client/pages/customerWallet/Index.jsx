import {
  Card,
  Layout,
  Page,
  Text,
  TextField,
  IndexTable,
  Badge,
} from "@shopify/polaris";
import { useNavigate } from "raviger";
import { useMemo, useState, useCallback, useEffect } from "react";
import { getCutomerWallet } from "../../helpers/customerWallet.js";
import { useAppBridge } from "@shopify/app-bridge-react";
import CustomerChangesLogs from "../../components/CustomerWallet/CustomerChangesLogs.jsx";

const CustomerWallet = () => {
  const navigator = useNavigate();
  const shopify = useAppBridge();
  const [queryValue, setQueryValue] = useState("");
  const [customersList, setCustomersList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleQueryChange = useCallback((value) => {
    setQueryValue(value);
  }, []);

  const rowMarkup = customersList.map(
    (
      { customerId, firstName, lastName, email, phone, walletBalance },
      index
    ) => (
      <IndexTable.Row
        onClick={() => navigator(`/customer-wallet/${customerId}`)}
        id={customerId}
        key={customerId}
        position={index}
      >
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {firstName} {lastName}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{email}</IndexTable.Cell>
        <IndexTable.Cell>{phone}</IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" alignment="end">
            {walletBalance}
          </Text>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getCutomerWallet();
        setCustomersList(data.customerWallets);
      } catch (err) {
        console.log("Failed to get customers list");
        shopify.toast.show("Failed", {
          isError: true,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getCutomerWallet(queryValue);
        setCustomersList(data.data || data.customerWallets || []);
      } catch (err) {
        console.error("Search failed", err);
        shopify.toast.show("Failed", {
          isError: true,
        });
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [queryValue]);
  return (
    <Page
      title="Customer's wallet"
      backAction={{
        onAction: () => navigator("/"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card padding={0}>
            <div style={{ padding: "10px" }}>
              <TextField
                label="Search customer"
                loading={loading}
                labelHidden
                value={queryValue}
                onChange={handleQueryChange}
                placeholder="Search by customer name, phone, email"
                clearButton
                onClearButtonClick={() => setQueryValue("")}
                autoComplete="off"
              />
            </div>
            <IndexTable
              selectable={false}
              resourceName={{ singular: "customer", plural: "customers" }}
              itemCount={customersList.length}
              headings={[
                { title: "Customer name" },
                { title: "Email" },
                { title: "Phone" },
                { title: "Wallet balance", alignment: "end" },
              ]}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <CustomerChangesLogs />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default CustomerWallet;
