import {
  BlockStack,
  Button,
  Card,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { ExternalIcon } from "@shopify/polaris-icons";
import { Link, navigate } from "raviger";

const HomePage = () => {
  return (
    <Page>
      <InlineGrid columns={2} gap={200}>
        <Card>
          <Link variant="breadcrumb" href="/customer-wallet">Customer wallet</Link>
        </Card>
        <Card>
          <Link href="/discounts">Manage Discounts</Link>
        </Card>
        <Card>
          <Link href="/distribution">Manage Distribution</Link>
        </Card>
        <Card>
          <Link href="/storefront-offers">Storefront offers</Link>
        </Card>
        <Card>
          <Link href="/settings">Settings</Link>
        </Card>
      </InlineGrid>
    </Page>
  );
};

export default HomePage;
