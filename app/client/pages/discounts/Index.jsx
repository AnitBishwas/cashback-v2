import {
  Card,
  Page,
  Text,
  Layout,
  useIndexResourceState,
  IndexTable,
  Badge,
  Icon,
  Button,
} from "@shopify/polaris";
import {
  DiscountFilledIcon,
  DeleteIcon,
  EditIcon,
} from "@shopify/polaris-icons";
import DiscountCreateForm from "../../components/discounts/DiscountCreateForm";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { getCashbackDiscounts } from "../../helpers/discounts.js";
import { useState } from "react";
import DiscountDeleteForm from "../../components/discounts/DiscountDeletForm";
import DiscountEditForm from "../../components/discounts/DiscountEditForm";
import DiscountChangesLogs from "../../components/discounts/DiscountChangesLogs";

const Discounts = () => {
  const shopify = useAppBridge();
  const [discountsList, setDiscountsList] = useState([]);

  const handleCreateButtonClick = () => {
    shopify.modal.show("discount_create_form");
  };

  const resourceName = {
    singular: "discount",
    plural: "discounts",
  };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(discountsList);
  const rowMarkup = discountsList.map(
    (
      {
        _id,
        title,
        status,
        type,
        value,
        orderAboveApplication,
        createdAt,
        updatedAt,
      },
      index
    ) => (
      <IndexTable.Row
        onClick={() => console.log("this was clicked" + _id)}
        hideSelectable={true}
        id={_id}
        key={_id}
        selected={selectedResources.includes(_id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {title}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {status == "active" ? (
            <Badge tone="success">Active</Badge>
          ) : (
            <Badge tone="critical">Draft</Badge>
          )}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {type == "percentage" ? "Percentage" : "Fixed"}
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text alignment="center" variant="headingXs">
            {value}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{new Date(createdAt).toDateString()}</IndexTable.Cell>
        <IndexTable.Cell>
          <Button
            onClick={() =>
              document.dispatchEvent(
                new CustomEvent("custom:displayDiscountEditForm", {
                  detail: { id: _id },
                })
              )
            }
            icon={EditIcon}
            variant="monochromePlain"
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div style={{ marginLeft: "auto", width: "max-content" }}>
            <Button
              onClick={() =>
                document.dispatchEvent(
                  new CustomEvent("custom:displayDiscountDeleteForm", {
                    detail: { id: _id },
                  })
                )
              }
              icon={DeleteIcon}
              variant="monochromePlain"
            />
          </div>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  useEffect(() => {
    (async () => {
      const { discounts } = await getCashbackDiscounts();
      setDiscountsList(discounts);
    })();
    document.addEventListener("custom:discountListUpdate", async () => {
      const { discounts } = await getCashbackDiscounts();
      setDiscountsList(discounts);
    });
  }, []);
  return (
    <>
      <DiscountCreateForm />
      <DiscountDeleteForm />
      <DiscountEditForm />
      <Page
        primaryAction={{
          content: "Create Discount",
          onAction: handleCreateButtonClick,
          icon: DiscountFilledIcon,
        }}
        backAction={{ content: "Home", url: "/" }}
        title="Manage discounts"
      >
        <Layout>
          <Layout.Section>
            <Card padding={0}>
              <IndexTable
                selectable={false}
                resourceName={resourceName}
                itemCount={discountsList.length}
                selectedItemsCount={
                  allResourcesSelected ? "All" : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                headings={[
                  { title: "Title" },
                  { title: "Status" },
                  { title: "Type" },
                  { title: "Discount value" },
                  { title: "Created at" },
                  { title: "Edit" },
                  { title: "Delete", alignment: "end" },
                ]}
              >
                {rowMarkup}
              </IndexTable>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <DiscountChangesLogs />
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
};

export default Discounts;
