// src/components/sessions/SessionDetailPopup.jsx
import React, { useMemo, useState, useEffect } from "react";
import { X, Video, Clock, CalendarDays } from "lucide-react";

function VideoPlayerModal({ open, url, onClose }) {
  if (!open || !url) return null;

  const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <div className="bg-black rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/70">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm sm:text-base font-semibold text-white">
              Xem lại video cuộc gọi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Player */}
        <div className="flex-1 bg-black flex items-center justify-center">
          <div className="w-full aspect-video">
            {isYoutube ? (
              <iframe
                key={url}
                src={url.replace("watch?v=", "embed/")}
                title="Session recording"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                key={url}
                src={url}
                className="w-full h-full"
                controls
                autoPlay
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SessionDetailPopup({ open, onClose, session }) {
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const recordings = session?.recordingUrls || [
    // demo khi chưa có data thật
    "https://www.youtube.com/watch?v=J8kV4jMwky4",
    "https://www.youtube.com/watch?v=6OqLRe2Irso",
  ];

  useEffect(() => {
    if (open) {
      // reset state khi mở popup
      setSelectedUrl(null);
      setVideoModalOpen(false);
    } else {
      setSelectedUrl(null);
      setVideoModalOpen(false);
    }
  }, [open]);

  const { startedAtText, endedAtText, durationText } = useMemo(() => {
    if (!session) {
      return {
        startedAtText: "—",
        endedAtText: "—",
        durationText: "—",
      };
    }

    const started = session.startedAt ? new Date(session.startedAt) : null;
    const ended = session.endedAt ? new Date(session.endedAt) : null;
    const durationSec =
      session.durationSec &&
      session.durationSec > 0 &&
      !Number.isNaN(session.durationSec)
        ? session.durationSec
        : started && ended
        ? Math.floor((ended.getTime() - started.getTime()) / 1000)
        : 0;

    const formatDate = (d) =>
      d ? d.toLocaleString("vi-VN", { hour12: false }) : "—";

    const formatDuration = (sec) => {
      if (!sec || sec <= 0) return "Chưa xác định";
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      if (h > 0) return `${h} giờ ${m} phút ${s} giây`;
      if (m > 0) return `${m} phút ${s} giây`;
      return `${s} giây`;
    };

    return {
      startedAtText: formatDate(started),
      endedAtText: formatDate(ended),
      durationText: formatDuration(durationSec),
    };
  }, [session]);

  if (!open) return null;

  const handleOpenVideo = (url) => {
    setSelectedUrl(url);
    setVideoModalOpen(true);
  };

  return (
    <>
      {/* Popup chi tiết session */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Chi tiết cuộc gọi
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4 overflow-y-auto">
            {/* Thông tin chung */}
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="space-y-1">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-teal-600" />
                  Thời lượng cuộc gọi
                </div>
                <div>{durationText}</div>
              </div>

              <div className="space-y-1">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600" />
                  Bắt đầu
                </div>
                <div>{startedAtText}</div>
              </div>

              <div className="space-y-1">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-500" />
                  Kết thúc
                </div>
                <div>{endedAtText}</div>
              </div>
            </div>

            {/* Danh sách bản ghi */}
            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-900 ">
                  Danh sách bản ghi cuộc gọi
                </h3>
                <div className="text-sm">{recordings.length} file</div>
              </div>

              {recordings.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Chưa có file ghi hình nào cho phiên này.
                </div>
              ) : (
                <div className="space-y-2">
                  {recordings.map((url, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Video className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="font-medium">Bản ghi #{idx + 1}</span>
                        <span className="text-xs text-gray-500 truncate max-w-[150px]">
                          {url}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenVideo(url)}
                        className="ml-2 text-xs px-3 py-1 rounded-md border border-teal-600 text-teal-700 hover:bg-teal-600 hover:text-white transition-colors"
                      >
                        Xem video
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-3 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Popup phát video */}
      <VideoPlayerModal
        open={videoModalOpen}
        url={selectedUrl}
        onClose={() => setVideoModalOpen(false)}
      />
    </>
  );
}
