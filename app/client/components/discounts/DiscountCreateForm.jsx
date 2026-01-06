import { createCashbackDiscount } from "../../helpers/discounts.js";
import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import {
  Checkbox,
  InlineGrid,
  InlineStack,
  Select,
  TextField,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";

const DiscountCreateForm = () => {
  const shopify = useAppBridge();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [type, setType] = useState("percentage");
  const [value, setValue] = useState(0);
  const [orderAboveApplication, setOrderAboveApplication] = useState(false);
  const [formValidation, setFormValidation] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

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
    setStatus("percentage");
    setType("percentage");
    setValue("0");
    setOrderAboveApplication(false);
    setFormValidation(false);
  };

  const handleCancelButton = () => {
    shopify.modal.hide("discount_create_form");
  };
  const handleFormSubmission = async () => {
    setStatusLoading(true);
    try {
      const payload = {
        title: title,
        status: status,
        type: type,
        value: Number(value),
        orderAboveApplication: orderAboveApplication,
      };
      const createRequest = await createCashbackDiscount(payload);
      shopify.toast.show("Created");
      shopify.modal.hide("discount_create_form");
      document.dispatchEvent(new Event("custom:discountListUpdate"));
    } catch (err) {
      console.log("Failed to handle form submission reason -->" + err.message);
      shopify.toast.show("Creation failed", {
        isError: true,
      });
    } finally {
      setStatusLoading(false);
    }
  };
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
    <Modal onHide={handleModalClose} id="discount_create_form">
      <TitleBar title="Create discount">
        {!statusLoading && (
          <button
            onClick={handleFormSubmission}
            disabled={!formValidation}
            variant="primary"
          >
            Create
          </button>
        )}
        {statusLoading && (
          <button loading="true" disabled={!formValidation} variant="primary">
            Create
          </button>
        )}

        <button onClick={handleCancelButton}>Cancel</button>
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

export default DiscountCreateForm;
