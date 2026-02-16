import { getCustomerWalletSummary } from "../../helpers/customerWallet.js";
import {
  BlockStack,
  Card,
  Layout,
  Page,
  Text,
  InlineStack,
  InlineGrid,
  Button,
} from "@shopify/polaris";
import { useNavigate, usePath } from "raviger";
import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { EditIcon } from "@shopify/polaris-icons";
import PointsList from "../../components/CustomerWallet/PointsList";
import TransactionsList from "../../components/CustomerWallet/TransactionsList.jsx";
import PhoneEditPopup from "../../components/CustomerWallet/PhoneEditPopup.jsx";

const CustomerWallet = () => {
  const navigator = useNavigate();
  const shopify = useAppBridge();
  const path = usePath();
  const [walletSummary, setWalletSummary] = useState({});

  useEffect(() => {
    (async () => {
      shopify.loading(true);
      try {
        const customerId = path.replace("/customer-wallet/", "");
        const walletSummary = await getCustomerWalletSummary(customerId);
        setWalletSummary({
          name:
            walletSummary?.customer?.firstName +
              " " +
              walletSummary?.customer?.lastName || "",
          email: walletSummary?.customer?.email || "",
          phone: walletSummary?.customer?.phone || "",
          customerId: walletSummary?.customer?.customerId || "",
          walletBalance: walletSummary?.wallet?.balance || 0,
          walletId: walletSummary?.wallet?.walletId || 0,
        });
      } catch (err) {
        console.log("Failed to load customer wallet data");
        shopify.toast.show("Failed", {
          isError: true,
        });
      } finally {
        shopify.loading(false);
      }
    })();
  }, []);
  useEffect(() => {
    let updatePhoneField = (e) => {
      setWalletSummary({
        ...walletSummary,
        phone: e.detail.phone,
      });
    };
    document.addEventListener("customer:phoneUpdated", updatePhoneField);
    return () =>
      document.removeEventListener("customer:phoneUpdated", updatePhoneField);
  }, []);
  if (!walletSummary) {
    return <></>;
  }
  return (
    <Page
      backAction={{
        onAction: () => {
          navigator("/customer-wallet");
        },
      }}
      title={walletSummary.name}
    >
      <PhoneEditPopup />
      <Layout>
        <Layout.Section>
          <Card>
            <InlineGrid align="space-evenly" columns={3}>
              <div>
                <BlockStack gap={200}>
                  <Text variant="headingMd">Customer name</Text>
                  <Text>{walletSummary.name}</Text>
                </BlockStack>
              </div>
              <BlockStack gap={200}>
                <Text variant="headingMd">Email</Text>
                <Text>{walletSummary.email}</Text>
              </BlockStack>
              <BlockStack gap={200} inlineAlign="end" align="start">
                <Text alignment="start" variant="headingMd">
                  Phone
                </Text>
                <InlineStack gap={300} blockAlign="center">
                  <Text>{walletSummary.phone}</Text>
                  <Button
                    onClick={() =>
                      document.dispatchEvent(
                        new CustomEvent("custom:phonePopup", {
                          detail: {
                            phone: walletSummary.phone,
                            customerId: walletSummary.customerId,
                          },
                        })
                      )
                    }
                    icon={EditIcon}
                    variant="monochromePlain"
                  />
                </InlineStack>
              </BlockStack>
            </InlineGrid>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneHalf">
          <PointsList customerId={walletSummary.customerId} />
        </Layout.Section>
        <Layout.Section variant="oneHalf">
          <TransactionsList walletId={walletSummary.walletId} />
        </Layout.Section>
      </Layout>
    </Page>
  );
};
export default CustomerWallet;
