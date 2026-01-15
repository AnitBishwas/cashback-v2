import { deleteStorefrontOffer } from "../../helpers/storefront";
import { TitleBar, useAppBridge, Modal } from "@shopify/app-bridge-react";
import { Text, Card } from "@shopify/polaris";
import { useEffect, useState } from "react";

const OfferDeletePopup = () => {
  const [offer, setOffer] = useState({});
  const [loading, setLoading] = useState(false);
  const shopify = useAppBridge();

  const handleModalClose = () => {
    setOffer({});
  };
  const handleDeleteButton = async () => {
    setLoading(true);
    try {
      const deleteOffer = await deleteStorefrontOffer(offer._id);
      shopify.toast.show("Success");
      shopify.modal.hide("offer_delete_popup");
      setOffer({});
      document.dispatchEvent(new Event("custom:UpdateStorefrontOffer"));
    } catch (err) {
      console.log("Failed to handle delete button reason -->" + err.message);
      shopify.toast.show("Failed", {
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const deleteOffer = (e) => {
      if (!e?.detail?.offer) {
        console.log("Failed to display offer delete popup");
        shopify.toast.show("Failed", { isError: true });
      } else {
        setOffer(e.detail.offer);
        shopify.modal.show("offer_delete_popup");
      }
    };
    document.addEventListener("custom:OfferDeletePopup", deleteOffer);
    return () => {
      document.removeEventListener("custom:OfferDeletePopup", deleteOffer);
    };
  }, []);
  return (
    <Modal id="offer_delete_popup" onHide={handleModalClose}>
      <TitleBar title={`Delete ${offer.code}`}>
        <button onClick={() => shopify.modal.hide("offer_delete_popup")}>
          Cancel
        </button>
        {!loading && (
          <button
            onClick={handleDeleteButton}
            variant="primary"
            tone="critical"
          >
            Confirm
          </button>
        )}
        {loading && (
          <button tone="critical" variant="primary" disabled loading="true">
            Confirm
          </button>
        )}
      </TitleBar>
      <Card roundedAbove="0">
        <Text>
          Deleting offers can‘t be undone. Are you sure you want to delete the
          selected offer?
        </Text>
      </Card>
    </Modal>
  );
};

export default OfferDeletePopup;
