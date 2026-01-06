import clientProvider from "../../utils/clientProvider.js";

/**
 * @param {string} query - search query
 * @param {string} shop - shopify store handle Ex: swiss-local-dev.myshopify.com
 */
const getQueriedCustomer = async (query, shop) => {
  try {
    const { client } = await clientProvider.offline.graphqlClient({ shop });
    const gQuery = `query CustomerList{
            customers(first: 5, query:"${query}"){
                nodes{
                    id
                    firstName
                    lastName
                    defaultEmailAddress {
                        emailAddress
                    }
                    defaultPhoneNumber {
                        phoneNumber
                    }
                }
            }
        }`;
    const { data, extensions, errors } = await client.request(gQuery);
    if (errors && errors.length > 0) {
      throw new Error("Failed to query customer at the moment");
    }
    if (extensions.cost.throttleStatus.currentlyAvailable < 400) {
      await new Promise((res, rej) => {
        setTimeout(() => {
          res(true);
        }, 600);
      });
    }
    return data.customers.nodes;
  } catch (err) {
    throw new Error("Failed to get queried customer reason -->" + err.message);
  }
};

/**
 *
 * @param {string} customerId - shopify cusmtomer id
 */
const getCustomerWalletBalanceByShopifyId = async (customerId) => {
  try {
    // const customerWallet = await
  } catch (err) {
    throw new Error(
      "Failed to get customer wallet balance by shopify id reason -->" +
        err.message
    );
  }
};
export { getQueriedCustomer };
