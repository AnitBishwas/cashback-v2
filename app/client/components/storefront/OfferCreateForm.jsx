import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import { TextField, Card, InlineGrid, Select } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { createStorefrontOffer } from "../../helpers/storefront.js";

const OfferCreateForm = () => {
  const shopify = useAppBridge();
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

  const handleFormClosure = () => {
    setDiscountCode("");
    setDiscountStatus("disabled");
    setDiscountTitle("");
    setDiscountDescription("");
    setDiscountBtnText("");
    setDiscountBtnRedirection("");
    setInfoTitle("");
    setInfoDescription("");
    setInfoTermsConditions("");
  };
  const handleFormSubmission = async () => {
    setLoading(true);
    try {
      const payload = {
        code: discountCode,
        status: discountStatus,
        title: discountTitle,
        description: discountDescription,
        btn: {
          text: discountBtnText,
          url: discountBtnRedirection,
        },
        info: {
          title: infoTitle,
          description: infoDescription,
          terms: infoTermsConditions,
        },
      };
      const createOffer = await createStorefrontOffer(payload);
      if (createOffer.ok) {
        shopify.toast.show("Created");
      }
      shopify.modal.hide("offer_create_form");
      document.dispatchEvent(new Event("custom:UpdateStorefrontOffer"));
    } catch (err) {
      console.log("Failed to handle form submission reason -->" + err.message);
      shopify.toast.show("Failed", {
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal id="offer_create_form" onHide={handleFormClosure}>
      <TitleBar title="Create discount">
        <button>Cancel</button>
        {!loading && (
          <button
            disabled={!isFormValid}
            variant="primary"
            onClick={handleFormSubmission}
          >
            Create
          </button>
        )}
        {loading && (
          <button disabled={true} loading="true" variant="primary">
            Create
          </button>
        )}
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
export default OfferCreateForm;
