import {
  Badge,
  Button,
  InlineGrid,
  Text,
  Card,
  InlineStack,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { DeleteIcon, EditIcon } from "@shopify/polaris-icons";
import { DragHandleIcon } from "@shopify/polaris-icons";
import OfferDeletePopup from "./OfferDeletePopup";
import { updateStorefrontOfferPosition } from "../../helpers/storefront.js";
import { useNavigate } from "raviger";

const OffersList = ({ offers }) => {
  const [offersList, setOffersList] = useState(offers);
  const navigate = useNavigate();
  const handleDeleteButtonClick = (offer) => {
    document.dispatchEvent(
      new CustomEvent("custom:OfferDeletePopup", {
        detail: { offer },
      })
    );
  };
  const handlePositionUpdate = async (value) => {
    const previousList = [...offersList];
    try {
      const newIndex = value.newIndex;
      const oldIndex = value.oldIndex;
      if (oldIndex == newIndex) return;
      const movedOffer = previousList.find(
        (el) => el._id == value.item.dataset.id
      );
      const positionUpdate = await updateStorefrontOfferPosition(
        movedOffer._id,
        newIndex
      );
      shopify.toast.show("Success");
    } catch (err) {
      console.log("Failed to handle position update reason -->" + err.message);
      setOffersList(previousList);
      shopify.toast.show("Failed", {
        isError: true,
      });
    }
  };
  const handleEditButtonClick = (offer) => {
    navigate("/storefront-offers/" + offer._id);
  };
  useEffect(() => {
    setOffersList(offers);
  }, [offers]);
  return (
    <>
      <OfferDeletePopup />
      <ReactSortable
        onEnd={handlePositionUpdate}
        list={offersList}
        setList={setOffersList}
      >
        {offersList.map(({ _id, code, status }, index) => (
          <div key={_id} data-id={{ _id }}>
            <Card>
              <InlineGrid columns={2}>
                <InlineStack gap={500}>
                  <Button icon={DragHandleIcon} variant="plain" />
                  <Text>{code}</Text>
                  <Badge tone={status == "disabled" ? "attention" : "success"}>
                    {status == "disabled" ? "Disabled" : "Active"}
                  </Badge>
                </InlineStack>
                <InlineStack gap={500} align="end">
                  <Button
                    onClick={() => handleDeleteButtonClick(offersList[index])}
                    icon={DeleteIcon}
                    variant="plain"
                  />
                  <Button
                    onClick={() => {
                      handleEditButtonClick(offersList[index]);
                    }}
                    icon={EditIcon}
                    variant="plain"
                  />
                </InlineStack>
              </InlineGrid>
            </Card>
            {<div style={{ marginTop: 10 }}></div>}
          </div>
        ))}
      </ReactSortable>
    </>
  );
};
export default OffersList;
