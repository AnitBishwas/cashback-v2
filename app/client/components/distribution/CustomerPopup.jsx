import { TitleBar, Modal, useAppBridge } from "@shopify/app-bridge-react";
import {
  Card,
  EmptySearchResult,
  Icon,
  ResourceItem,
  ResourceList,
  TextField,
  Text,
  InlineGrid,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { SearchIcon } from "@shopify/polaris-icons";
import { getCutomer } from "../../helpers/customer.js";

const CustomerPopup = () => {
  const shopify = useAppBridge();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomerDeep, setSelectedCustomerDeep] = useState([]);

  const handleSearchKeyword = useCallback(async (value) => {
    return setSearchKeyword(value);
  }, []);

  const handleModalClose = () => {
    setSearchKeyword("");
    setCustomers([]);
    setSelectedCustomers([]);
    setLoading(false);
  };
  const handleSelectButton = () => {
    document.dispatchEvent(
      new CustomEvent("custom:CustomersSelected", {
        detail: {
          customers: [...selectedCustomerDeep],
        },
      })
    );
    shopify.modal.hide("customer_search_popup");
  };
  useEffect(() => {
    document.addEventListener("custom:displayCustomerPopup", (e) => {
      shopify.modal.show("customer_search_popup");
    });
    return () =>
      document.removeEventListener("custom:displayCustomerPopup", () => {});
  }, []);

  useEffect(() => {
    if (!debouncedKeyword) return;
    (async () => {
      setLoading(true);
      try {
        const customersList = await getCutomer(searchKeyword);
        const mappedCustomer = customersList.customers.map((el) => ({
          id: el.id,
          firstName: el.firstName,
          lastName: el.lastName,
          email: el.defaultEmailAddress?.emailAddress || null,
          phone: el.defaultPhoneNumber?.phoneNumber || null,
        }));
        setCustomers(mappedCustomer);
      } catch (err) {
        console.log("Failed to search customer reason -->" + err.message);
        shopify.toast.show("Failed", { isError: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedKeyword]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchKeyword]);
  useEffect(() => {
    let newList = [];
    // existing customers checked and added
    selectedCustomers.forEach((el) => {
      let checkIfItExist = selectedCustomerDeep.find(
        (customer) => customer.id == el
      );
      if (checkIfItExist) {
        newList.push(checkIfItExist);
      } else {
        let newElement = customers.find((customer) => customer.id == el);
        newList.push(newElement);
      }
    });
    if (selectedCustomers.length == 0) {
      newList = [];
    }
    setSelectedCustomerDeep(newList);
  }, [selectedCustomers]);
  return (
    <Modal id="customer_search_popup" onHide={handleModalClose}>
      <TitleBar title="Search Customer">
        <button
          onClick={handleSelectButton}
          variant="primary"
          disabled={selectedCustomers.length == 0}
        >
          Select
        </button>
        <button onClick={() => shopify.modal.hide("customer_search_popup")}>
          Cancel
        </button>
      </TitleBar>
      <Card roundedAbove={0}>
        <TextField
          onChange={handleSearchKeyword}
          value={searchKeyword}
          placeholder="Select Customer"
          prefix={<Icon source={SearchIcon} />}
          loading={loading}
          focused={true}
        />
        <div style={{ marginBottom: 6 }}></div>
        <ResourceList
          resourceName={{ singular: "customer", plural: "customers" }}
          items={customers}
          selectedItems={selectedCustomers}
          emptyState={
            <div style={{ paddingTop: 20 }}>
              <EmptySearchResult title="No Customer" withIllustration={true} />
            </div>
          }
          onSelectionChange={setSelectedCustomers}
          selectable
          renderItem={(customer) => {
            const { id, firstName, lastName, email, phone } = customer;
            return (
              <ResourceItem id={id} name={firstName}>
                <InlineGrid columns={3}>
                  <Text>
                    {firstName} {lastName}
                  </Text>
                  {phone && <Text>{phone}</Text>}
                  {email && <Text>{email}</Text>}
                </InlineGrid>
              </ResourceItem>
            );
          }}
        />
      </Card>
    </Modal>
  );
};
export default CustomerPopup;
