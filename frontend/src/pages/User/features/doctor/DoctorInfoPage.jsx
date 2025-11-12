import React, { useMemo, useState, useEffect } from "react";
import { currency } from "../../../../utils/helper";

/* ---------------- Small UI atoms ---------------- */
function Tag({ children }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-slate-200 text-slate-700 bg-white/70 backdrop-blur-sm shadow-sm">
      {children}
    </span>
  );
}

function Section({ title, children, right }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

const roleLabel = (r) =>
  r === "psychiatrist"
    ? "Psychiatrist"
    : r === "therapist"
    ? "Therapist"
    : r === "counselor"
    ? "Counselor"
    : r || "—";

const doctorName = (d) =>
  d?.accountId?.fullName || d?.fullName || d?.name || "Bác sĩ";

const priceOf = (d) => d?.pricePerWeek ?? 0;

const mapDoctorCard = (d) => ({
  id: d._id,
  name: doctorName(d),
  avatar: d.avatar,
  role: d.role,
  yearsExperience: d.yearsExperience ?? 0,
  pricePerWeek: priceOf(d),
  rating: d.rating ?? 0,
  reviewsCount: d.reviewsCount ?? 0,
  specializations: d.specializations || [],
  modalities: d.modalities || [],
  bio: d.bio || "",
  approval: d.approval?.status || "pending",
  certificates: d.certificates || [],
});

/* ---------------- Fancy bits ---------------- */
function StarRating({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-sm ${
            i < Math.round(v) ? "text-amber-500" : "text-slate-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function IconSearch(props) {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
      />
    </svg>
  );
}

/* ---------------- Certificates preview modal ---------------- */
function PreviewModal({
  open,
  images = [],
  index = 0,
  onClose,
  onPrev,
  onNext,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;
  const src = images[index] || images[0];
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative h-full w-full flex items-center justify-center p-6">
        <div className="relative max-w-5xl w-full">
          <img
            src={src}
            alt={`certificate-${index}`}
            className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl ring-1 ring-black/5"
          />
          <div className="absolute -top-12 right-0 flex items-center gap-2">
            <button
              onClick={onPrev}
              className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-sm shadow border border-slate-200"
            >
              ← Trước
            </button>
            <button
              onClick={onNext}
              className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-sm shadow border border-slate-200"
            >
              Tiếp →
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-sm shadow border border-slate-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Switch doctor modal (with pagination) ---------------- */
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }).map((_, i) => i + 1);
  const show = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );
  return (
    <div className="flex items-center gap-1">
      <button
        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm disabled:opacity-50"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        ←
      </button>
      {show.map((p, idx) => {
        const prev = show[idx - 1];
        const needDots = prev && p - prev > 1;
        return (
          <React.Fragment key={p}>
            {needDots && <span className="px-2 text-slate-400">…</span>}
            <button
              onClick={() => onChange(p)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                p === page
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-slate-300 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}
      <button
        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm disabled:opacity-50"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        →
      </button>
    </div>
  );
}

function SwitchDoctorModal({ open, onClose, suggestions = [], onPick }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [sort, setSort] = useState("reco");
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const cards = useMemo(() => suggestions.map(mapDoctorCard), [suggestions]);

  const filtered = useMemo(() => {
    let list = cards.slice();
    const kw = q.trim().toLowerCase();
    if (kw) {
      list = list.filter((d) => {
        const sps = d.specializations.join(" ").toLowerCase();
        const mods = d.modalities.join(" ").toLowerCase();
        return (
          d.name.toLowerCase().includes(kw) ||
          sps.includes(kw) ||
          mods.includes(kw)
        );
      });
    }
    if (role !== "all") list = list.filter((d) => d.role === role);
    switch (sort) {
      case "priceAsc":
        list.sort((a, b) => a.pricePerWeek - b.pricePerWeek);
        break;
      case "priceDesc":
        list.sort((a, b) => b.pricePerWeek - a.pricePerWeek);
        break;
      case "ratingDesc":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "expDesc":
        list.sort((a, b) => b.yearsExperience - a.yearsExperience);
        break;
      default:
        break; // giữ thứ tự backend đề xuất
    }
    return list;
  }, [cards, q, role, sort]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-5xl mx-auto mt-5 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Chọn bác sĩ thay thế</h3>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="mt-3 grid gap-3 md:grid-cols-4 ">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="placeholder:text-gray-600 w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Tìm theo tên / chuyên môn / phương pháp…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="counselor">Counselor</option>
            <option value="therapist">Therapist</option>
            <option value="psychiatrist">Psychiatrist</option>
          </select>
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="reco">Phù hợp</option>
            <option value="priceAsc">Giá tăng dần</option>
            <option value="priceDesc">Giá giảm dần</option>
            <option value="ratingDesc">Rating cao</option>
            <option value="expDesc">Kinh nghiệm cao</option>
          </select>
          <div className="text-sm text-slate-600 grid place-items-end">
            {total} bác sĩ
          </div>
        </div>

        {/* List */}
        <div className="mt-3 grid gap-3 md:grid-cols-2 ">
          {pageItems.length === 0 ? (
            <div className="col-span-2 text-slate-600 text-sm">
              Không có gợi ý phù hợp. Thử đổi bộ lọc hoặc từ khóa.
            </div>
          ) : (
            pageItems.map((d) => (
              <article
                key={d.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-y-auto"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={
                      d.avatar ||
                      "https://via.placeholder.com/80x80.png?text=Dr"
                    }
                    alt={d.name}
                    className="h-16 w-16 rounded-xl object-contain ring-1 ring-black/5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-nowrap justify-between">
                      <div className="flex gap-2 flex-wrap">
                        <div className="font-semibold">{d.name}</div>
                        <Tag>{roleLabel(d.role)}</Tag>
                      </div>
                      <button
                        onClick={() => {
                          const ok = window.confirm("Xác nhận đổi bác sĩ?");
                          if (!ok) return;
                          onPick?.(d);
                        }}
                        className="px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-95 text-sm shadow "
                      >
                        Chọn bác sĩ này
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-slate-700 line-clamp-2">
                      {d.bio}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-700">
                      <div className="inline-flex items-center gap-1">
                        <StarRating value={d.rating} />
                        <span>({d.rating})</span>
                      </div>
                      <div>🎓 {d.yearsExperience} năm KN</div>
                      <div>💳 {currency(d.pricePerWeek)}/tuần</div>
                    </div>
                    {(d.specializations.length || d.modalities.length) && (
                      <div className="mt-2">
                        {/* Chuyên môn */}
                        <div>
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Chuyên môn
                          </div>
                          {d.specializations.length ? (
                            <div className="flex flex-wrap gap-2">
                              {d.specializations.slice(0, 4).map((s) => (
                                <Tag key={s}>{s}</Tag>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400">—</div>
                          )}
                        </div>

                        {/* Phương pháp */}
                        <div className="mt-2">
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Phương pháp
                          </div>
                          {d.modalities.length ? (
                            <div className="flex flex-wrap gap-2">
                              {d.modalities.slice(0, 3).map((m) => (
                                <Tag key={m}>{m}</Tag>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400">—</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Trang {currentPage}/{totalPages}
          </div>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={(p) => setPage(Math.min(Math.max(1, p), totalPages))}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Doctor info page ---------------- */
export default function DoctorInfoPage({ doctor, suggestions = [], onSwitch }) {
  const [openSwitch, setOpenSwitch] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [certIndex, setCertIndex] = useState(0);

  if (!doctor) return null;

  const d = mapDoctorCard(doctor);
  const certs = d.certificates || [];

  const openCertAt = (idx) => {
    setCertIndex(idx);
    setCertOpen(true);
  };
  const prevCert = () =>
    setCertIndex((i) => (i - 1 + certs.length) % certs.length);
  const nextCert = () => setCertIndex((i) => (i + 1) % certs.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-indigo-50/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="flex items-start gap-4">
          <img
            src={d.avatar || "https://via.placeholder.com/96.png?text=Dr"}
            alt={d.name}
            className="h-20 w-20 rounded-2xl ring-1 ring-black/5 object-contain"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold tracking-tight">{d.name}</h2>
              <Tag>{roleLabel(d.role)}</Tag>
            </div>
            <p className="text-slate-700 mt-2">{d.bio}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-700">
              <div className="inline-flex items-center gap-1">
                <StarRating value={d.rating} />
                <span>({d.rating})</span>
              </div>
              <div>🎓 {d.yearsExperience} năm KN</div>
              <div>💳 {currency(d.pricePerWeek)}/tuần</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setOpenSwitch(true)}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 shadow-sm"
            >
              Đổi bác sĩ
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {/* Chuyên môn */}
        <Section title="Chuyên môn">
          {doctor.specializations?.length ? (
            <div className="flex flex-wrap gap-2">
              {doctor.specializations.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-600">
              Chưa cập nhật chuyên môn
            </div>
          )}
        </Section>

        {/* Phương pháp */}
        <Section title="Phương pháp">
          {doctor.modalities?.length ? (
            <div className="flex flex-wrap gap-2">
              {doctor.modalities.map((m) => (
                <Tag key={m}>{m}</Tag>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-600">
              Chưa cập nhật phương pháp
            </div>
          )}
        </Section>
      </div>

      {/* Chứng chỉ */}
      <Section
        title="Chứng chỉ"
        right={
          certs.length ? (
            <div className="text-sm text-slate-500">{certs.length} tệp</div>
          ) : null
        }
      >
        {certs.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {certs.map((url, i) => (
              <button
                key={url + i}
                onClick={() => openCertAt(i)}
                className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-md"
                title="Xem chứng chỉ"
              >
                <img
                  src={url}
                  alt={`certificate-${i}`}
                  className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 flex items-end justify-between p-2">
                  <span className="text-[10px] text-white/90 bg-black/40 px-2 py-0.5 rounded">
                    Xem
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-600">Chưa cập nhật chứng chỉ</div>
        )}
      </Section>

      {/* Đánh giá gần đây (placeholder) */}
      <Section title="Đánh giá gần đây">
        <div className="text-sm text-slate-600">
          Rating tổng: <b>{d.rating}</b> • {d.reviewsCount} đánh giá
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="border border-slate-200 rounded-xl p-3 bg-white/80">
            <div className="text-sm text-slate-600">
              Người dùng ẩn danh • gần đây
            </div>
            <div className="mt-1">“Tư vấn rõ ràng, dễ hiểu, hữu ích.”</div>
          </div>
          <div className="border border-slate-200 rounded-xl p-3 bg-white/80">
            <div className="text-sm text-slate-600">
              Người dùng ẩn danh • gần đây
            </div>
            <div className="mt-1">“Chuyên nghiệp, đúng giờ, nhiệt tình.”</div>
          </div>
        </div>
      </Section>

      {/* Modals */}
      <SwitchDoctorModal
        open={openSwitch}
        onClose={() => setOpenSwitch(false)}
        suggestions={suggestions}
        onPick={(picked) => {
          setOpenSwitch(false);
          onSwitch?.(picked); // picked.id = _id
        }}
      />
      <PreviewModal
        open={certOpen}
        images={certs}
        index={certIndex}
        onClose={() => setCertOpen(false)}
        onPrev={prevCert}
        onNext={nextCert}
      />
    </div>
  );
}
