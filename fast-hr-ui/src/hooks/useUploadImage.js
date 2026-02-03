import { useEffect, useRef, useState } from "react";
import axios from "axios";

function getImgBBKey() {
  // Works for CRA (REACT_APP_) and Vite (VITE_).
  return (
    process.env.REACT_APP_IMGBB_API_KEY ||
    ""
  );
}

export default function useUploadImage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // For cancel.
  const abortRef = useRef(null);

  // Create local preview when file changes.
  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    return () => {
      URL.revokeObjectURL(localUrl);
    };
  }, [file]);

  function chooseFile(newFile) {
    setError("");
    setUploadedUrl("");
    setFile(newFile || null);
  }

  async function upload() {
    setError("");

    const apiKey = getImgBBKey();
    if (!apiKey) {
      setError("Missing IMGBB API key in .env.local.");
      return null;
    }

    if (!file) {
      setError("Please choose an image first.");
      return null;
    }

    // Cancel any previous upload
    cancel();

    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        formData,
        {
          signal: controller.signal,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const url = res.data?.data?.url;
      if (!url) {
        setError("Upload succeeded but URL is missing.");
        return null;
      }

      setUploadedUrl(url);
      return url;
    } catch (err) {
      // If aborted
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        setError("Upload canceled.");
        return null;
      }

      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Upload failed.";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function cancel() {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }

  function reset() {
    cancel();
    setFile(null);
    setPreviewUrl("");
    setUploadedUrl("");
    setError("");
    setLoading(false);
  }

  return {
    file,
    previewUrl,
    uploadedUrl,
    loading,
    error,
    chooseFile,
    upload,
    cancel,
    reset,
  };
}
