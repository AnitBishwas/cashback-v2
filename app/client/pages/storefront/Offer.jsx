import { Card, EmptyState, Layout, Page, Text } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { DiscountFilledIcon } from "@shopify/polaris-icons";
import OfferCreateForm from "../../components/storefront/OfferCreateForm";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getStorefrontOffers } from "../../helpers/storefront.js";
import OffersList from "../../components/storefront/OffersList";

const StorefrontOffer = () => {
  const shopify = useAppBridge();
  const [offers, setOffers] = useState([]);

  const displayDiscountCreateForm = () => {
    shopify.modal.show("offer_create_form");
  };

  useEffect(() => {
    let isMounted = true;

    const fetchOffers = async () => {
      try {
        const offersList = await getStorefrontOffers();
        if (isMounted) {
          setOffers([...offersList]);
        }
      } catch (err) {
        console.error("Failed to fetch offers", err);
      }
    };

    const handleUpdateStorefrontOffer = () => {
      fetchOffers();
    };
    fetchOffers();
    document.addEventListener(
      "custom:UpdateStorefrontOffer",
      handleUpdateStorefrontOffer
    );

    return () => {
      isMounted = false;
      document.removeEventListener(
        "custom:UpdateStorefrontOffer",
        handleUpdateStorefrontOffer
      );
    };
  }, []);

  return (
    <>
      <OfferCreateForm />
      <Page
        title="Manage storefront offers"
        primaryAction={{
          content: "Add offer",
          icon: DiscountFilledIcon,
          onAction: displayDiscountCreateForm,
        }}
      >
        <Layout>
          <Layout.Section>
            <Card>
              {offers.length == 0 && (
                <EmptyState
                  heading="No offers"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  action={{
                    content: "Add offer",
                    icon: DiscountFilledIcon,
                  }}
                />
              )}
              {offers.length > 0 && <OffersList offers={offers} />}
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <Text>Somthing</Text>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
};

export default StorefrontOffer;
