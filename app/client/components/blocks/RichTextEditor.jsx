// RichTextEditor.jsx
import React, { useEffect, useMemo, useState } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "link",
    ],
    []
  );

  // SSR-safe: don't render editor until mounted on client
  if (!mounted) {
    return (
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
        Loading editor…
      </div>
    );
  }

  return (
    <div>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
