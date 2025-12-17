import { Card, Page, Text } from "@shopify/polaris";

const Discounts = () => {
  const dummyData = [
    {
      _id: {
        $oid: "69282006b2d30b047660f95c",
      },
      title: "SBCBPAYTM",
      status: "active",
      type: "percentage",
      value: 100,
      orderAboveApplication: false,
      createdAt: {
        $date: "2025-11-27T09:55:18.703Z",
      },
      updatedAt: {
        $date: "2025-11-27T09:55:18.703Z",
      },
      __v: 0,
    },
    {
      _id: {
        $oid: "692fe436717738f2d315b253",
      },
      title: "fullcb",
      status: "active",
      type: "percentage",
      value: 100,
      orderAboveApplication: false,
      createdAt: {
        $date: "2025-12-03T07:18:14.709Z",
      },
      updatedAt: {
        $date: "2025-12-03T07:18:14.709Z",
      },
      __v: 0,
    },
  ];
  return (
    <>
      <Page backAction={{ content: "Home", url: "/" }} title="Manage discounts">
        <Card></Card>
      </Page>
    </>
  );
};

export default Discounts;
