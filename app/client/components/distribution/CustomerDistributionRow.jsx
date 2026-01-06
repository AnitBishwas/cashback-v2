import {
  IndexTable,
  Text,
  BlockStack,
  TextField,
  Button,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { DeleteIcon } from "@shopify/polaris-icons";

const CustomerDistributionRow = ({
  id,
  firstName,
  lastName,
  email,
  phone,
  index,
  selectedResources,
  removeSelectedCustomer,
  updateCashbackAmountForCustomer,
  updateCashbackExpiryDateForCustomer,
  updateCashbackNoteForCustomer,
}) => {
  const [cashbackAmount, setCashbackAmount] = useState(0);
  const [expiryDate, setExpiryDate] = useState("");
  const [note, setNote] = useState("");

  const handleAmountChange = useCallback((value) => {
    updateCashbackAmountForCustomer(id, value);
    return setCashbackAmount(value);
  });
  const handleExpiryDateChange = useCallback((value) => {
    updateCashbackExpiryDateForCustomer(id, value);
    return setExpiryDate(value);
  });
  const handleNoteChange = useCallback((value) => {
    updateCashbackNoteForCustomer(id, value);
    return setNote(value);
  });

  return (
    <IndexTable.Row
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text>
          {firstName} {lastName}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <BlockStack>
          <Text>{phone}</Text>
          <Text>{email}</Text>
        </BlockStack>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <TextField
          value={cashbackAmount}
          min={0}
          onChange={handleAmountChange}
        />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <TextField
          type="date"
          value={expiryDate}
          onChange={handleExpiryDateChange}
        />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <TextField value={note} onChange={handleNoteChange} />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            icon={DeleteIcon}
            variant="monochromePlain"
            onClick={() => removeSelectedCustomer(id)}
          />
        </div>
      </IndexTable.Cell>
    </IndexTable.Row>
  );
};
export default CustomerDistributionRow;
