import {
  deleteCashbackDiscount,
  getCashbackDiscount,
} from "../../helpers/discounts.js";
import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import { Badge, Card, InlineStack, Text } from "@shopify/polaris";
import { useEffect, useState } from "react";

const DiscountDeleteForm = () => {
  const shopify = useAppBridge();
  const [discount, setDiscount] = useState();
  const [loading, setLoading] = useState(false);

  const hideDiscountDeleteForm = () => {
    shopify.modal.hide("discount_delete_form");
  };

  const handleModalClose = () => {
    setDiscount();
  };

  const handleDeleteButton = async () => {
    try {
      const deleteDiscount = await deleteCashbackDiscount(discount._id);
      shopify.toast.show("Deleted");
      document.dispatchEvent(new Event("custom:discountListUpdate"));
      shopify.modal.hide("discount_delete_form");
    } catch (err) {
      console.log("Failed to delete discount --> " + err.message);
      shopify.toast.show("Deletion failed", {
        isError: true,
      });
    }
  };
  useEffect(() => {
    try {
      document.addEventListener(
        "custom:displayDiscountDeleteForm",
        async (e) => {
          if (!e?.detail?.id) {
            throw new Error("Id is missing");
          }
          shopify.modal.show("discount_delete_form");
          let data = await getCashbackDiscount(e.detail.id);
          setDiscount(data.discount);
        }
      );
      return () => {
        document.removeEventListener(
          "custom:displayDiscountDeleteForm",
          () => {}
        );
      };
    } catch (err) {
      console.log("Failed to display delete form reason -->" + err.message);
    }
  }, []);
  return (
    <Modal id="discount_delete_form" onHide={handleModalClose}>
      <TitleBar title="Delete discount">
        {discount &&
          (loading ? (
            <button variant="primary" disabled loading tone="critical">
              Confirm
            </button>
          ) : (
            <button
              onClick={handleDeleteButton}
              variant="primary"
              tone="critical"
            >
              Confirm
            </button>
          ))}
        {!discount && (
          <button variant="primary" disabled loading="true">
            Confirm
          </button>
        )}
        <button onClick={hideDiscountDeleteForm}>Cancel</button>
      </TitleBar>
      {discount && (
        <Card roundedAbove="0">
          <Text>
            Are you sure you want to delete {discount.title}? this can't be
            undone
          </Text>
        </Card>
      )}
    </Modal>
  );
};
export default DiscountDeleteForm;
