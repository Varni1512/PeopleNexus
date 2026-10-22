import React, { useState } from "react";
import { UploadCloud, CheckCircle, AlertCircle, X } from "lucide-react";

export function UploadModal({ isOpen, onClose }) {
  const [adminKey, setAdminKey] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus({ type: "error", message: "Please select a file to ingest." });
      return;
    }

    setIsUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: {
          "x-admin-key": adminKey || "change-me-in-production",
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload document");
      }

      setStatus({
        type: "success",
        message: `Indexed "${data.file}" successfully into Pinecone (${data.chunks} chunks created).`,
      });
      setFile(null);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      id="upload-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm grid place-items-center p-4 z-50 animate-fadeIn"
    >
      <div
        id="upload-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0f1624] border border-slate-700/80 rounded-2xl p-6 sm:p-7 flex flex-col gap-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Ingest HR Knowledge Document</h2>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed">
          Upload PDF, DOCX, Markdown, or TXT documents. The file will be parsed, chunked, converted to 384-dim embeddings with Xenova BGE, and indexed into Pinecone.
        </p>

        <form onSubmit={handleUpload} className="flex flex-col gap-3.5">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">
              Admin API Key:
            </label>
            <input
              id="admin-key-input"
              type="password"
              placeholder="Enter Admin API Key (default: change-me-in-production)"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full bg-[#090e18] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">
              Select Document (.pdf, .docx, .md, .txt):
            </label>
            <div
              onClick={() => document.getElementById("file-upload-input").click()}
              className="border-2 border-dashed border-slate-800 hover:border-emerald-500/40 rounded-xl p-6 text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-emerald-500/[0.03]"
            >
              <UploadCloud size={32} className="text-emerald-400 mx-auto mb-2" />
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                {file ? file.name : "Click here to choose a document"}
              </div>
              <input
                id="file-upload-input"
                type="file"
                accept=".pdf,.docx,.md,.txt"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
            </div>
          </div>

          <button
            id="submit-ingest-btn"
            type="submit"
            disabled={isUploading}
            className="w-full mt-2 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-[#061e14] font-bold text-sm py-3 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md shadow-emerald-500/20"
          >
            {isUploading ? "Chunking & Indexing..." : "Index Document into Pinecone"}
          </button>
        </form>

        {status && (
          <div
            id="upload-status-box"
            className={`p-3 rounded-xl text-xs sm:text-sm border flex items-center gap-2 ${
              status.type === "success"
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-300 border-rose-500/30"
            }`}
          >
            {status.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{status.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
