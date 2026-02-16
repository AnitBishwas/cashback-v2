import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { TextField, Card, Button, InlineStack } from "@shopify/polaris";
import { useCallback, useEffect, useMemo, useState } from "react";
import { updateCustomerPhone } from "../../helpers/customerWallet.js";

const PhoneEditPopup = () => {
  const shopify = useAppBridge();

  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [touched, setTouched] = useState(false);

  const handlePhoneChange = useCallback((value) => {
    setCustomerPhone(value);
    setTouched(true);
  }, []);

  const isValidIndianPhone = useMemo(() => {
    return /^\+91\d{10}$/.test(String(customerPhone || "").trim());
  }, [customerPhone]);
  const isFormValid = useMemo(() => {
    const current = String(customerPhone || "").trim();
    const original = String(originalPhone || "").trim();
    return Boolean(customerId) && isValidIndianPhone && current !== original;
  }, [customerId, customerPhone, originalPhone, isValidIndianPhone]);

  const phoneError = useMemo(() => {
    if (!touched) return "";
    if (!customerPhone?.trim()) return "Phone number is required.";
    if (!isValidIndianPhone)
      return "Enter a valid phone number like +919876543210.";
    return "";
  }, [touched, customerPhone, isValidIndianPhone]);

  const displayPopup = useCallback(
    (e) => {
      try {
        const { phone, customerId } = e.detail || {};
        const initialPhone = String(phone || "").trim();

        setCustomerPhone(initialPhone);
        setOriginalPhone(initialPhone);
        setCustomerId(customerId || "");
        setTouched(false);

        shopify.modal.show("phone_edit_popup");
      } catch (err) {
        console.log(err?.message);
        shopify.toast.show("Failed to show edit popup", { isError: true });
      }
    },
    [shopify]
  );

  const closePopup = useCallback(() => {
    shopify.modal.hide("phone_edit_popup");
  }, [shopify]);

  const onUpdate = useCallback(async () => {
    if (!isFormValid) return;

    try {
      shopify.loading(true);

      await updateCustomerPhone(customerId, customerPhone);

      shopify.toast.show("Phone number updated");
      closePopup();
      document.dispatchEvent(
        new CustomEvent("customer:phoneUpdated", {
          detail: { customerId, phone: customerPhone },
        })
      );
    } catch (err) {
      shopify.toast.show(err.message || "Update failed", { isError: true });
    } finally {
      shopify.loading(false);
    }
  }, [isFormValid, customerId, customerPhone, shopify, closePopup]);

  useEffect(() => {
    document.addEventListener("custom:phonePopup", displayPopup);
    return () => {
      document.removeEventListener("custom:phonePopup", displayPopup);
    };
  }, [displayPopup]);

  return (
    <Modal id="phone_edit_popup">
      <TitleBar title="Update customer phone number">
        <button onClick={closePopup}>Cancel</button>
        <button variant="primary" disabled={!isFormValid} onClick={onUpdate}>
          Update
        </button>
      </TitleBar>

      <Card roundedAbove="0">
        <div style={{ padding: 16 }}>
          <TextField
            label="Phone number"
            value={customerPhone}
            onChange={handlePhoneChange}
            autoComplete="off"
            error={phoneError || undefined}
            helpText="Format: +91 followed by 10 digits (e.g. +919876543210)"
          />
        </div>
      </Card>
    </Modal>
  );
};

export default PhoneEditPopup;
