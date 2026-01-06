import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { InlineGrid, TextField, Select, Checkbox } from "@shopify/polaris";
import { useEffect, useState, useCallback } from "react";
import {
  getCashbackDiscount,
  updateCashbackDiscount,
} from "../../helpers/discounts.js";

const DiscountEditForm = () => {
  const shopify = useAppBridge();
  const [discount, setDiscount] = useState();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [type, setType] = useState("percentage");
  const [value, setValue] = useState(0);
  const [orderAboveApplication, setOrderAboveApplication] = useState(false);
  const [formValidation, setFormValidation] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const hideForm = () => {
    shopify.modal.hide("discount_edit_form");
  };

  const statusOptions = [
    {
      label: "Draft",
      value: "draft",
    },
    {
      label: "Active",
      value: "active",
    },
  ];
  const typeOptions = [
    {
      label: "Percentage",
      value: "percentage",
    },
    {
      label: "Fixed",
      value: "fixed",
    },
  ];

  const handleTitleChange = useCallback((value) => setTitle(value), []);
  const handleStatusChange = useCallback((value) => setStatus(value), []);
  const handleTypeChange = useCallback((value) => setType(value), []);
  const handleValueChange = useCallback((value) => setValue(value), []);
  const handleOrderAboveApplicationChange = useCallback(
    (value) => setOrderAboveApplication(value),
    []
  );

  const handleModalClose = () => {
    setTitle("");
    setType("percentage");
    setStatus("draft");
    setOrderAboveApplication(false);
    setValue(0);
  };
  const handleFormSubmission = async () => {
    try {
      setStatusLoading(true);
      const payload = {
        title: title,
        status: status,
        type: type,
        value: Number(value),
        orderAboveApplication: orderAboveApplication,
      };
      const updateDiscount = await updateCashbackDiscount(
        discount._id,
        payload
      );
      shopify.toast.show("Updated");
      shopify.modal.hide("discount_edit_form");
      document.dispatchEvent(new Event("custom:discountListUpdate"));
    } catch (err) {
      shopify.toast.show("Failed", {
        isError: true,
      });
      console.log("Failed to update discount reason -->" + err.message);
    } finally {
      setStatusLoading(false);
    }
  };
  useEffect(() => {
    try {
      document.addEventListener("custom:displayDiscountEditForm", async (e) => {
        setStatusLoading(true);
        if (!e?.detail?.id) {
          throw new Error("Id is missing");
        }
        shopify.modal.show("discount_edit_form");
        let { discount } = await getCashbackDiscount(e.detail.id);
        if (!discount) {
          throw new Error("Failed to get discount data");
        }
        setDiscount(discount);
        setTitle(discount.title);
        setStatus(discount.status);
        setType(discount.type);
        setValue(discount.value);
        setOrderAboveApplication(discount.orderAboveApplication);
        setStatusLoading(false);
      });
      return () => {
        document.removeEventListener(
          "custom:displayDiscountEditForm",
          () => {}
        );
      };
    } catch (err) {
      console.log("Failed to display edit form reason -->" + err.message);
      shopify.toast.show("Failed", { isError: true });
    }
  }, []);
  useEffect(() => {
    setFormValidation(true);
    if (title.trim().length == 0) {
      setFormValidation(value);
    }
    if (status != "draft" && status != "active") {
      setFormValidation(false);
    }
    if (type != "percentage" && type != "fixed") {
      setFormValidation(false);
    }
    if (value <= 0) {
      setFormValidation(false);
    }
  }, [title, status, type, value, orderAboveApplication]);
  return (
    <Modal id="discount_edit_form" onHide={handleModalClose}>
      <TitleBar title="Edit discount">
        {!statusLoading && (
          <button
            onClick={handleFormSubmission}
            variant="primary"
            disabled={!formValidation}
          >
            Update
          </button>
        )}
        {statusLoading && (
          <button variant="primary" loading="true" disabled>
            Update
          </button>
        )}
        <button onClick={hideForm}>Cancel</button>
      </TitleBar>
      <div style={{ padding: 20 }}>
        <InlineGrid columns={2} gap={300}>
          <TextField
            onChange={handleTitleChange}
            value={title}
            label="Enter coupon title"
          />
          <Select
            onChange={handleStatusChange}
            options={statusOptions}
            label="Status"
            value={status}
          />
        </InlineGrid>
        <div style={{ marginTop: 10 }}></div>
        <InlineGrid columns={2} gap={300}>
          <Select
            onChange={handleTypeChange}
            options={typeOptions}
            label="Discount type"
            value={type}
          />
          <TextField
            onChange={handleValueChange}
            value={value}
            label="Discount value"
            type="number"
            min={0}
          />
        </InlineGrid>
        <div style={{ marginTop: 10 }}></div>
        <Checkbox
          checked={orderAboveApplication}
          label="Allow coupon to be applied above order cashback"
          onChange={handleOrderAboveApplicationChange}
        />
      </div>
    </Modal>
  );
};
export default DiscountEditForm;
