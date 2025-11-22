import { AlignLeft, MoveLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserContext } from "../../context/userContext";

export default function PendingApproval() {
  const { handleLogout } = useUserContext();
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* Top accent */}
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400" />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="h-8 w-8 text-indigo-600"
                aria-hidden="true"
              >
                <path
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l3.5 3.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
              Tài khoản bác sĩ đang chờ phê duyệt
            </h1>
            <p className="mt-3 text-slate-600">
              Quản trị viên hiện chưa xét duyệt tài khoản của bạn. Khi được phê
              duyệt, bạn có thể truy cập đầy đủ các chức năng dành cho bác sĩ.
            </p>

            {/* Tips */}
            <ul className="mt-6 space-y-2 text-left text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                Vui lòng kiểm tra email để xem yêu cầu bổ sung (nếu có).
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                Bạn có thể quay lại trang chủ để tiếp tục khám phá.
              </li>
            </ul>

            {/* Actions */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                onClick={handleLogout}
                to="/"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <MoveLeftIcon className="w-4 h-4 mr-1 items-center" /> Quay lại
                trang chủ
              </Link>

              {/* <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Thử kiểm tra lại
              </button> */}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 text-xs text-slate-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l3.5 3.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            Tình trạng: Chờ phê duyệt
          </div>
        </div>
      </div>
    </div>
  );
}
