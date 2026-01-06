import CustomerPopup from "../../components/distribution/CustomerPopup";
import DistributionChangesLogs from "../../components/distribution/DistributionChangesLogs";
import {
  Layout,
  Page,
  Card,
  TextField,
  Icon,
  useIndexResourceState,
  IndexTable,
  Button,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useEffectEvent, useState } from "react";
import CustomerDistributionRow from "../../components/distribution/CustomerDistributionRow";
import { useAppBridge } from "@shopify/app-bridge-react";
import { distributeCashback } from "../../helpers/distribute.js";

const Distribution = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [requestpayload, setRequestPayload] = useState([]);
  const [payloadValid, setPayloadValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const shopify = useAppBridge();

  const handleSearchKeywordFocus = () => {
    document.dispatchEvent(new Event("custom:displayCustomerPopup"));
  };
  const removeSelectedCustomer = (customerId) => {
    const updatedList = selectedCustomers.filter((el) => el.id != customerId);
    setSelectedCustomers(updatedList);
  };
  const handleSearchKeywordChange = useCallback((value) =>
    setSearchKeyword(value)
  );
  const updateCashbackAmountForCustomer = (customerId, amount) => {
    let updatedArray = selectedCustomers.map((el) => {
      if (el.id == customerId) {
        el["amount"] = amount;
      }
      return el;
    });
    setRequestPayload(updatedArray);
  };
  const updateCashbackExpiryDateForCustomer = (customerId, date) => {
    let updatedArray = selectedCustomers.map((el) => {
      if (el.id == customerId) {
        el["expiryDate"] = date;
      }
      return el;
    });
    setRequestPayload(updatedArray);
  };
  const updateCashbackNoteForCustomer = (customerId, note) => {
    let updatedArray = selectedCustomers.map((el) => {
      if (el.id == customerId) {
        el["note"] = note;
      }
      return el;
    });
    setRequestPayload(updatedArray);
  };
  const resourceName = {
    singular: "customer",
    plural: "customers",
  };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(selectedCustomers);
  const customersRowMarkup = selectedCustomers.map(
    ({ id, firstName, lastName, email, phone }, index) => {
      return (
        <CustomerDistributionRow
          id={id}
          firstName={firstName}
          lastName={lastName}
          email={email}
          phone={phone}
          index={index}
          selectedResources={selectedResources}
          removeSelectedCustomer={removeSelectedCustomer}
          updateCashbackAmountForCustomer={updateCashbackAmountForCustomer}
          updateCashbackExpiryDateForCustomer={
            updateCashbackExpiryDateForCustomer
          }
          updateCashbackNoteForCustomer={updateCashbackNoteForCustomer}
        />
      );
    }
  );
  const handleDistibuteButtonClick = async () => {
    setLoading(true);
    try {
      const distributionRequest = await distributeCashback(requestpayload);
      shopify.toast.show("Success");
      setSelectedCustomers([]);
      setRequestPayload([]);
      setPayloadValid(false);
    } catch (err) {
      console.log(
        "Failed to handle distribute button click reason -->" + err.message
      );
      shopify.toast.show("Failed", {
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    document.addEventListener("custom:CustomersSelected", (e) => {
      setSelectedCustomers(e.detail.customers);
      setRequestPayload(e.detail.customers);
    });
    return () => {
      document.removeEventListener("custom:CustomersSelected", () => {});
    };
  }, []);
  useEffect(() => {
    setPayloadValid(true);
    if (requestpayload.length == 0) {
      setPayloadValid(false);
    }
    requestpayload.forEach((el) => {
      if (
        !el.amount ||
        Number(el.amount) <= 0 ||
        !el.expiryDate ||
        new Date().getTime() > new Date(el.expiryDate).getTime()
      ) {
        setPayloadValid(false);
      }
    });
  }, [requestpayload]);
  useEffect(() => {
    let newRequestPayload = requestpayload.filter((el) =>
      selectedCustomers.find((customer) => customer.id == el.id)
    );
    setRequestPayload(newRequestPayload);
  }, [selectedCustomers]);
  return (
    <>
      <CustomerPopup />
      <Page title="Manage distribution">
        <Layout>
          <Layout.Section>
            <Card>
              <TextField
                value={searchKeyword}
                onFocus={handleSearchKeywordFocus}
                onChange={handleSearchKeywordChange}
                placeholder="Search customer"
                prefix={<Icon source={SearchIcon} />}
              />
            </Card>
            {selectedCustomers.length > 0 && (
              <>
                <div style={{ marginTop: 10 }}></div>
                <Card padding={0}>
                  <IndexTable
                    resourceName={resourceName}
                    itemCount={selectedCustomers.length}
                    selectable={false}
                    onSelectionChange={handleSelectionChange}
                    headings={[
                      {
                        title: "Name",
                      },
                      {
                        title: "Info",
                      },
                      {
                        title: "Cashback amount",
                      },
                      {
                        title: "Expriy date",
                        alignment: "center",
                      },
                      {
                        title: "Cashback note",
                      },
                      {
                        title: "Remove",
                      },
                    ]}
                  >
                    {customersRowMarkup}
                  </IndexTable>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      padding: 10,
                    }}
                  >
                    {loading && (
                      <Button disabled loading>
                        Distribute
                      </Button>
                    )}
                    {!loading && (
                      <Button
                        onClick={handleDistibuteButtonClick}
                        disabled={!payloadValid}
                        variant="primary"
                      >
                        Distribute
                      </Button>
                    )}
                  </div>
                </Card>
              </>
            )}
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <DistributionChangesLogs />
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
};

export default Distribution;
