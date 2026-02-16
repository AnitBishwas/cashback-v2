import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Card,
  DropZone,
  InlineStack,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { NoteIcon } from "@shopify/polaris-icons";

const BulkDistribution = () => {
  const shopify = useAppBridge();
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(false);

  const handleFileDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      if (!acceptedFiles[0].name.toLowerCase().endsWith(".csv")) {
        shopify.toast.show("Only CSV files are allowed", { isError: true });
        return;
      }
      if (acceptedFiles[0].size > 200000000) {
        shopify.toast.show("File size too big", { isError: true });
        return;
      }
      return setFile(acceptedFiles[0]);
    }
  );
  const validFilesType = ["file/csv"];
  const fileUpload = !file && <DropZone.FileUpload />;
  const uploadedFiles = file && (
    <div style={{ paddingTop: 10 }}>
      <BlockStack align="center" inlineAlign="center">
        <Thumbnail
          size="small"
          alt={file.name}
          source={
            validFilesType.includes(file.type)
              ? window.URL.createObjectURL(file)
              : NoteIcon
          }
        />
        <div style={{ marginTop: 10 }}>
          <BlockStack inlineAlign="center">
            <Text variant="bodyLg">{file.name}</Text>
            <Text>{file.size} bytes</Text>
          </BlockStack>
        </div>
      </BlockStack>
    </div>
  );

  const handleClose = () => {
    setFile(null);
  };
  const closeModal = () => shopify.modal.hide("bulk_distibute_popup");
  const showModal = () => {
    shopify.modal.show("bulk_distibute_popup");
  };
  const handleSubmission = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const url = "/api/apps/distribution/bulk";
      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "text/csv",
        }),
      });

      const { jobId, uploadUrl, bucket, key, ok, user } = await req.json();
      if (!ok) {
        throw new Error("Failed to create presigned url");
      }
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "text/csv",
        },
        body: file,
      });
      const uploadConfirmation = await fetch(
        "/api/apps/distribution/bulk/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId,
            bucket,
            key,
          }),
        }
      );
      if (!uploadConfirmation.ok) {
        throw new Error("Failed to upload file");
      }
      shopify.toast.show(`You will get update on ${user.email}`);
      closeModal();
      handleClose();
    } catch (err) {
      console.log("Failed to handel submission reason -->" + err.message);
      shopify.toast.show("Failed", { isError: true });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    document.addEventListener("custom:bulkDistribute", showModal);
    return () =>
      document.removeEventListener("custom:bulkDistribute", showModal);
  });
  return (
    <Modal id="bulk_distibute_popup" onHide={handleClose}>
      <TitleBar title="Bulk Distribute">
        <button onClick={closeModal}>Cancel</button>
        <button
          disabled={!file}
          loading={loading ? loading.toString() : false}
          onClick={handleSubmission}
          variant="primary"
        >
          Upload
        </button>
      </TitleBar>
      <Card roundedAbove="0">
        <Text>Max file size allowed 200MB</Text>
        <DropZone allowMultiple={false} onDrop={handleFileDrop}>
          {uploadedFiles}
          {fileUpload}
        </DropZone>
      </Card>
    </Modal>
  );
};

export default BulkDistribution;
