import { getDistributionLogs } from "../../helpers/logs.js";
import { Card, InlineStack, Icon, Text, BlockStack } from "@shopify/polaris";
import { ClockIcon } from "@shopify/polaris-icons";
import { useState, useEffect } from "react";

const DistributionChangesLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      const logs = await getDistributionLogs();
      setLogs(logs);
    })();
  }, []);
  return (
    <Card>
      <InlineStack align="space-between" blockAlign="center">
        <Text tone="caution" variant="headingSm">
          Recent Distributions
        </Text>
        <div>
          <Icon source={ClockIcon} />
        </div>
      </InlineStack>
      <div style={{ marginBottom: 10 }}></div>
      {logs.length == 0 && <Text>No Recent Changes</Text>}
      {logs.length > 0 && (
        <BlockStack>
          {logs.map((el) => (
            <div
              style={{
                borderBottomColor: "#a6a6a6",
                borderBottomWidth: 1,
                borderBottomStyle: "solid",
                marginBottom: 10,
                paddingBottom: 4,
              }}
              key={el._id}
            >
              <BlockStack>
                <Text>
                  {el.user.email} distributed ₹{el.newChanges.amount} cashback
                </Text>
                <Text>{new Date(el.createdAt).toLocaleString()}</Text>
              </BlockStack>
            </div>
          ))}
        </BlockStack>
      )}
    </Card>
  );
};

export default DistributionChangesLogs;
