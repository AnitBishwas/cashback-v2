import { useAppBridge } from "@shopify/app-bridge-react";
import generateReport from "../../helpers/reports.js";
import { useEffect, useState, useRef } from "react";
import ReportsList from "../../components/reports/Index.jsx";

const Index = () => {
  const [emailInputValue, setEmailInputValue] = useState("");
  const [emailsList, setEmailsList] = useState([]);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const reportOptions = [
    {
      name: "Utilisation",
      value: "utilisation",
    },
  ];
  const [selectedReportType, setSelectedReportType] = useState(
    reportOptions[0].value
  );
  const modalRef = useRef();
  const shopify = useAppBridge();

  const handleDateRangeChange = (value) => {
    let splitVal = value.split("--");
    setStartDate(splitVal[0]);
    setEndDate(splitVal[1]);
  };
  const addEmail = () => {
    setEmailsList((prev) => [...prev, emailInputValue]);
    setEmailInputValue(null);
  };
  const handleEmailDeleteButton = (value) => {
    setEmailsList((prev) => emailsList.filter((el) => el != value));
  };
  const resetForm = () => {
    setEmailsList([]);
    setSelectedReportType(reportOptions[0].value);
    setEmailInputValue(null);
    setStartDate(null);
    setEndDate(null);
  };
  const handleGenerateButton = async () => {
    try {
      setLoading(true);
      const payload = {
        type: selectedReportType,
        dateRange: {
          start: startDate,
          end: endDate,
        },
        recipients: emailsList,
      };
      const report = await generateReport(payload);
      modalRef.current.hideOverlay();
      shopify.toast.show("Request sent");
    } catch (err) {
      shopify.toast.show("Failed to send request");
      console.log("Failed to send report request reason -->" + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (
      !startDate ||
      !endDate ||
      emailsList.length == 0 ||
      !selectedReportType
    ) {
      setIsFormValid(false);
    } else {
      setIsFormValid(true);
    }
  }, [emailsList, startDate, endDate, selectedReportType]);
  useEffect(() => {
    const regex = /^[a-zA-Z0-9_.+\-]+[\x40][a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    setIsEmailValid(
      regex.test(emailInputValue) && emailsList.indexOf(emailInputValue) == -1
    );
  }, [emailInputValue]);
  return (
    <s-page heading="Cashback reports">
      <s-button slot="primary-action" commandFor="report-modal">
        Generate report
      </s-button>
      <s-box>
        <ReportsList />
      </s-box>
      <s-modal
        ref={modalRef}
        onHide={resetForm}
        id="report-modal"
        heading="Generate report"
      >
        <s-box>
          <s-grid
            rowGap="base"
            columnGap="large-100"
            gridTemplateColumns="repeat(2,1fr)"
          >
            <s-grid-item>
              <s-stack gap="base base">
                <s-select
                  label="Choose report type"
                  onInput={(e) => setSelectedReportType(e.target.value)}
                  value={reportOptions[0].value}
                >
                  {reportOptions.map((el, ind) => (
                    <s-option
                      value={el.value}
                      key={`option-${ind}-${el.value}`}
                    >
                      {el.name}
                    </s-option>
                  ))}
                </s-select>
                <s-stack direction="block" gap="base base">
                  <s-email-field
                    onInput={(e) => setEmailInputValue(e.target.value)}
                    label="Enter email"
                    value={emailInputValue}
                    error={
                      !isEmailValid && emailInputValue?.length > 0
                        ? "Invalid email format"
                        : null
                    }
                  />
                  {emailsList?.length > 0 && (
                    <s-stack
                      direction="inline"
                      gap="base small"
                      overflow="visible"
                    >
                      {emailsList.map((el, ind) => (
                        <s-button
                          onClick={() => handleEmailDeleteButton(el)}
                          key={`chip-${ind}`}
                          variant="tertiary"
                          icon="delete"
                        >
                          {el}
                        </s-button>
                      ))}
                    </s-stack>
                  )}
                  <s-button disabled={!isEmailValid} onClick={addEmail}>
                    Add
                  </s-button>
                </s-stack>
              </s-stack>
            </s-grid-item>
            <s-grid-item>
              <s-stack direction="inline" justifyContent="space-between">
                <s-text>Choose date range</s-text>
                <s-date-picker
                  onInput={(el) => handleDateRangeChange(el.target.value)}
                  type="range"
                />
              </s-stack>
            </s-grid-item>
          </s-grid>
        </s-box>
        <s-button
          slot="secondary-actions"
          commandFor="report-modal"
          command="--hide"
          variant="secondary"
        >
          Cancel
        </s-button>
        <s-button
          onClick={handleGenerateButton}
          slot="primary-action"
          variant="primary"
          disabled={!isFormValid}
          loading={loading}
        >
          Generate
        </s-button>
      </s-modal>
    </s-page>
  );
};
export default Index;
