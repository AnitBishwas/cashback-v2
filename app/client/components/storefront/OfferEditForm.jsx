import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useState, useCallback, useEffect } from "react";
import { Card, InlineGrid, TextField, Select } from "@shopify/polaris";

const OfferEditForm = () => {
  const shopify = useAppBridge();
  const [offer, setOffer] = useState({});
  const [discountCode, setDiscountCode] = useState("");
  const [discountStatus, setDiscountStatus] = useState("disabled");
  const [discountTitle, setDiscountTitle] = useState("");
  const [discountDescription, setDiscountDescription] = useState("");
  const [discountBtnText, setDiscountBtnText] = useState("");
  const [discountBtnRedirection, setDiscountBtnRedirection] = useState("");
  const [infoTitle, setInfoTitle] = useState("");
  const [infoDescription, setInfoDescription] = useState("");
  const [infoTermsConditions, setInfoTermsConditions] = useState("");
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    {
      value: "disabled",
      label: "Disabled",
    },
    {
      value: "active",
      label: "Active",
    },
  ];

  const handleDiscountCodeChange = useCallback((value) =>
    setDiscountCode(value)
  );
  const handleDiscountStatusChange = useCallback((value) =>
    setDiscountStatus(value)
  );
  const handleDiscountTitleChange = useCallback((value) =>
    setDiscountTitle(value)
  );
  const handleDiscountDescriptionChange = useCallback((value) =>
    setDiscountDescription(value)
  );
  const handleDiscountBtnTextChange = useCallback((value) =>
    setDiscountBtnText(value)
  );
  const handleDiscountBtnRedirectionChange = useCallback((value) =>
    setDiscountBtnRedirection(value)
  );
  const handleInfoTitleChange = useCallback((value) => setInfoTitle(value));
  const handleInfoDescriptionChange = useCallback((value) =>
    setInfoDescription(value)
  );
  const handleInfoTermsConditionsChange = useCallback((value) =>
    setInfoTermsConditions(value)
  );
  const isFormValid =
    discountCode?.trim() &&
    ["disabled", "active"].includes(discountStatus) &&
    discountTitle?.trim() &&
    discountDescription?.trim() &&
    discountBtnText?.trim() &&
    discountBtnRedirection?.trim() &&
    infoTitle?.trim() &&
    infoDescription?.trim() &&
    infoTermsConditions?.trim();

  document.addEventListener("custom:offerEditFormDisplay", async (e) => {
    try {
      if (!e.detail.offer) {
        throw new Error("Offer not provided");
      }
      const offer = e.detail.offer;
      shopify.modal.show("offer_edit_form");
      setOffer(offer);
      setDiscountCode(offer.code);
      setDiscountStatus(offer.status);
      setDiscountTitle(offer.title);
      setDiscountDescription(offer.description);
      setDiscountBtnText(offer.btnText);
      setDiscountBtnRedirection(offer.url);
      setInfoTitle(offer.info.title);
      setInfoDescription(offer.info.description);
      setInfoTermsConditions(offer.info.terms);
    } catch (err) {
      shopify.toast.show("Failed", { isError: true });
      console.log("Failed to display edit form reason -->" + err.message);
    }
  });

  return (
    <Modal id="offer_edit_form">
      <TitleBar title={`Edit offer ${offer?.code}`}>
        <button>Cancel</button>
        <button disabled={!isFormValid} variant="primary">
          Update
        </button>
      </TitleBar>
      <Card>
        <InlineGrid columns={2} gap={1000}>
          <TextField
            value={discountCode}
            onChange={handleDiscountCodeChange}
            label="Discount code"
          />
          <Select
            value={discountStatus}
            onChange={handleDiscountStatusChange}
            label="Status"
            options={statusOptions}
          />
        </InlineGrid>
        <div style={{ marginTop: 14 }}></div>
        <TextField
          value={discountTitle}
          onChange={handleDiscountTitleChange}
          label="Discount title"
        />
        <TextField
          value={discountDescription}
          onChange={handleDiscountDescriptionChange}
          label="Discount desciption"
        />
        <div style={{ marginTop: 14 }}></div>
        <InlineGrid columns={2} gap={1000}>
          <TextField
            value={discountBtnText}
            onChange={handleDiscountBtnTextChange}
            label="Discount button text"
          />
          <TextField
            value={discountBtnRedirection}
            onChange={handleDiscountBtnRedirectionChange}
            label="Redirection link"
            type="url"
          />
        </InlineGrid>
        <div style={{ marginTop: 14 }}></div>
        <TextField
          value={infoTitle}
          onChange={handleInfoTitleChange}
          label="Info title"
        />
        <div style={{ marginTop: 14 }}></div>
        <TextField
          value={infoDescription}
          onChange={handleInfoDescriptionChange}
          label="Info description"
        />
        <div style={{ marginTop: 14 }}></div>
        <TextField
          value={infoTermsConditions}
          onChange={handleInfoTermsConditionsChange}
          label="Info terms and conditions"
        />
      </Card>
    </Modal>
  );
};
export default OfferEditForm;
