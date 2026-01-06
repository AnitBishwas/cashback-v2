import {
  getCashbackSettings,
  updateCashbackSettings,
} from "../helpers/settings.js";
import {
  Page,
  Select,
  Card,
  InlineGrid,
  TextField,
  InlineStack,
  Layout,
} from "@shopify/polaris";
import { useNavigate } from "raviger";
import { useCallback, useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import SettingsChangesLogs from "../components/settings/ChangesLogs.jsx";

const Settings = () => {
  const navigate = useNavigate();
  const shopify = useAppBridge();
  const [selectedUsageOption, setSelectedUsageOption] = useState("percentage");
  const [usageValue, setUsageValue] = useState(0);
  const [selectedAllocationOption, setSelectedAllocationOption] =
    useState("percentage");
  const [allocationValue, setAllocationValue] = useState(0);
  const [maxCashbackValue, setMaxCashbackValue] = useState(0);
  const [cashbackExpiryPeriod, setCashbackExpiryPeriod] = useState(0);

  const usageOption = [
    {
      label: "Percentage",
      value: "percentage",
    },
    {
      label: "Fixed",
      value: "fixed",
    },
  ];
  const allocationOption = [
    {
      label: "Percentage",
      value: "percentage",
    },
    {
      label: "Fixed",
      value: "fixed",
    },
  ];
  const handleUsageOptionChange = useCallback(
    (value) => setSelectedUsageOption(value),
    []
  );
  const handleUsageValueChange = useCallback(
    (value) => setUsageValue(value),
    []
  );
  const handleAllocationOptionChange = useCallback(
    (value) => setSelectedAllocationOption(value),
    []
  );
  const handleAllocationValueChange = useCallback(
    (value) => setAllocationValue(value),
    []
  );
  const handleMaxCashbackValueChange = useCallback(
    (value) => setMaxCashbackValue(value),
    []
  );
  const handleCashbackExpiryValueChange = useCallback(
    (value) => setCashbackExpiryPeriod(value),
    []
  );
  const validatePayload = () => {
    try {
      let payload = {
        usage: {
          type: selectedUsageOption,
          value: usageValue,
        },
        allocation: {
          type: selectedAllocationOption,
          value: allocationValue,
        },
        maxCashback: maxCashbackValue,
        expiryPeriod: cashbackExpiryPeriod,
      };
      console.log(payload);
      if (payload.usage.type != "fixed" && payload.usage.type != "percentage") {
        throw new Error("Incorrect usage type");
      }
      if (payload.usage.value < 0) {
        throw new Error("Incorrect usage valuue, can't be less than 0");
      }
      if (
        payload.allocation.type != "fixed" &&
        payload.allocation.type != "percentage"
      ) {
        throw new Error("Incorrect allocation type");
      }
      if (payload.allocation.value < 0) {
        throw new Error("Incorrect allocation value");
      }
      if (payload.maxCashback <= 0) {
        throw new Error("Incorrect max cashback value");
      }
      if (payload.expiryPeriod <= 0) {
        throw new Error("Incorrect expiry period");
      }
      return payload;
    } catch (err) {
      throw new Error(err.message);
    }
  };
  const handleFormSubmnission = async (e) => {
    try {
      e.preventDefault();
      let payload = validatePayload();
      const data = await updateCashbackSettings(payload);
      if (!data.ok) {
        throw new Error("Error");
      }
      shopify.toast.show("Config updated");
    } catch (err) {
      console.log("Failed to handle form submission reason --> " + err.message);
      shopify.toast.show(err.message, {
        isError: true,
      });
    }
  };
  useEffect(() => {
    (async () => {
      try {
        const settings = await getCashbackSettings();
        if (!settings.ok) {
          throw new Error("Failed to get cashback settings");
        }
        setSelectedUsageOption(settings.usage.type);
        setUsageValue(settings.usage.value);
        setSelectedAllocationOption(settings.order_allocation.type);
        setAllocationValue(settings.order_allocation.value);
        setMaxCashbackValue(settings.max_cashback);
        setCashbackExpiryPeriod(settings.expiry_period);
      } catch (err) {
        console.log("Failed to get cashback settings reason -->" + err.message);
      }
    })();
  }, []);
  return (
    <Page
      backAction={{
        onAction: () => navigate("/"),
      }}
      title="Manage settings"
    >
      <Layout>
        <Layout.Section variant="oneHalf">
          <Card>
            <form data-save-bar onSubmit={handleFormSubmnission}>
              <InlineGrid columns={2} gap={300} align="space-between">
                <Select
                  label="Usage type"
                  options={usageOption}
                  value={selectedUsageOption}
                  onChange={handleUsageOptionChange}
                />
                <TextField
                  label="Usage value"
                  type="number"
                  value={usageValue}
                  prefix={selectedUsageOption == "fixed" ? "₹" : "%"}
                  onChange={handleUsageValueChange}
                  min={0}
                  max={selectedUsageOption == "percentage" ? 100 : 10000}
                />
              </InlineGrid>
              <div style={{ marginTop: 14 }}></div>
              <InlineGrid columns={2} gap={300} align="space-between">
                <Select
                  label="Allocation type"
                  options={allocationOption}
                  value={selectedAllocationOption}
                  onChange={handleAllocationOptionChange}
                />
                <TextField
                  value={allocationValue}
                  prefix={selectedAllocationOption == "fixed" ? "₹" : "%"}
                  type="number"
                  label="Allocation value"
                  onChange={handleAllocationValueChange}
                  min={0}
                  max={selectedAllocationOption == "percentage" ? 100 : 10000}
                />
              </InlineGrid>
              <div style={{ marginTop: 14 }}></div>
              <InlineGrid columns={2} gap={300} align="space-between">
                <TextField
                  prefix="₹"
                  label="Max cashback cap"
                  type="number"
                  value={maxCashbackValue}
                  onChange={handleMaxCashbackValueChange}
                  min={0}
                />
                <TextField
                  suffix="Days"
                  type="number"
                  value={cashbackExpiryPeriod}
                  label="Cashback expiry period"
                  onChange={handleCashbackExpiryValueChange}
                  min={0}
                />
              </InlineGrid>
            </form>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <SettingsChangesLogs />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Settings;
