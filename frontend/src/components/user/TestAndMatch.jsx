// src/pages/TestAndMatch.jsx
import React, { useEffect, useMemo, useState } from "react";

const CODES = ["PHQ-9", "GAD-7"]; // có thể mở rộng sau này

export default function TestAndMatch() {
  const [step, setStep] = useState(1); // 1: PHQ-9, 2: GAD-7, 3: Match, 4: Review
  const totalSteps = 4;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [testsMap, setTestsMap] = useState({}); // { code: {code,title,description,questions[]} }
  const [answers, setAnswers] = useState({}); // { code: number[] }
  const [pickedDoctorId, setPickedDoctorId] = useState(null);

  // dữ liệu đề xuất từ backend
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [doctors, setDoctors] = useState([]);

  // Thêm sau các useState khác
  const [sortKey, setSortKey] = useState("best"); // best | rating | experience | priceAsc | priceDesc | name

  // tuỳ hệ thống auth
  const token = ""; // ví dụ: localStorage.getItem("access_token") || "";

  // --- Fetch từng test theo code ---
  useEffect(() => {
    let mounted = true;

    const fetchTest = async (code) => {
      const res = await fetch(
        `http://localhost:8080/api/tests/${encodeURIComponent(code)}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.message || `Không tải được test ${code}`);
      return data; // { code,title,description,questions:[{question,options[],scores[]}] }
    };

    (async () => {
      try {
        setLoading(true);
        setError("");
        const results = {};
        for (const code of CODES) {
          const t = await fetchTest(code);
          results[code] = t;
        }
        if (!mounted) return;

        setTestsMap(results);

        // khởi tạo answers theo từng code
        const init = {};
        for (const code of CODES) {
          const len = results[code]?.questions?.length || 0;
          init[code] = Array(len).fill(null);
        }
        setAnswers(init);
      } catch (e) {
        if (mounted)
          setError(e.message || "Đã có lỗi xảy ra khi tải bài test.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = Math.round((step / totalSteps) * 100);

  const currentCode = step === 1 ? CODES[0] : step === 2 ? CODES[1] : null;
  const currentTest = currentCode ? testsMap[currentCode] : null;

  const validateStep = () => {
    if (step === 1 || step === 2) {
      const t = currentTest;
      if (!t) return false;
      const arr = answers[t.code] || [];
      return (
        arr.length === (t.questions?.length || 0) &&
        arr.every((x) => x !== null)
      );
    }
    if (step === 3) {
      return doctors.length === 0 || !!pickedDoctorId;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) {
      if (step === 3 && doctors.length > 0)
        return alert("Vui lòng chọn một bác sĩ.");
      return alert("Vui lòng trả lời đầy đủ câu hỏi trong bước này.");
    }
    setStep((s) => Math.min(totalSteps, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  // điểm tạm tính để hiển thị (chỉ phục vụ UI)
  const computed = useMemo(() => {
    const out = {};
    for (const code of CODES) {
      const t = testsMap[code];
      if (!t) continue;
      const pickedIdx = answers[code] || [];
      const total = pickedIdx.reduce((sum, idx, i) => {
        if (idx === null || idx === undefined) return sum;
        const q = t.questions[i];
        const score = q?.scores?.[idx] ?? 0;
        return sum + score;
      }, 0);
      out[code] = { score: total, count: pickedIdx.length };
    }
    return out;
  }, [testsMap, answers]);

  // --- Khi vào bước 3: gửi câu trả lời lên backend để lấy danh sách bác sĩ ---
  useEffect(() => {
    const shouldFetch =
      step === 3 && Object.keys(testsMap).length === CODES.length;
    if (!shouldFetch) return;

    let mounted = true;
    (async () => {
      try {
        setMatchLoading(true);
        setMatchError("");
        setPickedDoctorId(null);
        setDoctors([]);

        const payload = {
          tests: CODES.map((code) => ({
            code,
            answers: answers[code], // mảng index đáp án đã chọn
            // Nếu backend muốn điểm: bật dòng dưới
            // scores: answers[code].map((idx, i) => testsMap[code].questions[i].scores[idx]),
          })),
        };

        const res = await fetch("http://localhost:8080/api/doctors", {
          method: "GET",
        });
        console.log(payload);
        const data = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(data?.message || "Không lấy được danh sách bác sĩ.");
        if (!mounted) return;

        // Expecting: { doctors:[ {id, fullName, role, specialization[], bio, ...extraFields} ] }
        setDoctors(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted)
          setMatchError(e.message || "Đã có lỗi khi lấy đề xuất bác sĩ.");
      } finally {
        if (mounted) setMatchLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [step, testsMap, answers, token]);

  const submitFinal = async () => {
    try {
      const payload = {
        tests: CODES.map((code) => ({
          code,
          answers: answers[code],
        })),
        doctorId: pickedDoctorId || null,
      };

      const res = await fetch("/api/screening/submit-choice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Gửi xác nhận thất bại.");

      alert("Đã gửi xác nhận lựa chọn bác sĩ thành công!");
      console.log("SERVER RESPONSE:", data);
    } catch (e) {
      alert(e.message || "Đã có lỗi xảy ra khi gửi xác nhận.");
    }
  };
  // Helper lấy tên hiển thị
  const getDocName = (d) => d?.accountId?.fullName || d?.fullName || "";

  // Danh sách đã sắp xếp theo sortKey
  const sortedDoctors = useMemo(() => {
    const arr = Array.isArray(doctors) ? [...doctors] : [];
    switch (sortKey) {
      case "rating":
        arr.sort((a, b) => (b?.rating ?? 0) - (a?.rating ?? 0));
        break;
      case "experience":
        arr.sort(
          (a, b) => (b?.yearsExperience ?? 0) - (a?.yearsExperience ?? 0)
        );
        break;
      case "priceAsc":
        arr.sort(
          (a, b) =>
            (a?.pricePerWeek ?? Infinity) - (b?.pricePerWeek ?? Infinity)
        );
        break;
      case "priceDesc":
        arr.sort(
          (a, b) =>
            (b?.pricePerWeek ?? -Infinity) - (a?.pricePerWeek ?? -Infinity)
        );
        break;
      case "name":
        arr.sort((a, b) => getDocName(a).localeCompare(getDocName(b), "vi"));
        break;
      case "best":
      default:
        // giữ nguyên thứ tự backend
        break;
    }
    return arr;
  }, [doctors, sortKey]);

  // -----------------------
  // UI helpers
  // -----------------------
  const Card = ({ children }) => (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
      {children}
    </div>
  );

  const Badge = ({ children }) => (
    <span className="inline-block text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700 mr-1 mb-1">
      {children}
    </span>
  );

  const StarRating = ({ rating = 0 }) => {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            className={`w-4 h-4 ${i < r ? "fill-yellow-400" : "fill-gray-200"}`}
          >
            <path d="M10 15l-5.878 3.09L5.5 11.545.5 7.41l6.06-.88L10 1l3.44 5.53 6.06.88-5 4.136 1.378 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatCurrencyVND = (v) => {
    if (v == null) return null;
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(v);
    } catch {
      return `${v}₫`;
    }
  };

  const formatSlot = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString("vi-VN", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const RadioMatrix = ({ test }) => {
    const values = answers[test.code] || [];
    const onPick = (qIdx, optIdx) => {
      setAnswers((prev) => {
        const next = { ...prev };
        const arr = [...(next[test.code] || [])];
        arr[qIdx] = optIdx;
        next[test.code] = arr;
        return next;
      });
    };

    return (
      <Card>
        <h3 className="text-xl font-semibold text-gray-800 mb-1">
          {test.title}
        </h3>
        {test.description && (
          <p className="text-sm text-gray-600 mb-4">{test.description}</p>
        )}
        <div className="space-y-4">
          {test.questions.map((q, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-3">
                {idx + 1}. {q.question}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {(q.options || []).map((label, optIdx) => (
                  <label
                    key={optIdx}
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer transition
                      ${
                        values[idx] === optIdx
                          ? "border-teal-500 bg-teal-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name={`${test.code}_${idx}`}
                      className="accent-teal-600"
                      checked={values[idx] === optIdx}
                      onChange={() => onPick(idx, optIdx)}
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Thẻ bác sĩ chi tiết (Bước 3)
  const DoctorCard = ({ d, picked, onPick }) => {
    const [open, setOpen] = useState(false);
    const priceText = formatCurrencyVND(d?.pricePerWeek);
    const topSlots = Array.isArray(d?.nextSlots) ? d.nextSlots.slice(0, 3) : [];

    return (
      <label
        className={`border rounded-2xl p-4 cursor-pointer transition block hover:shadow
          ${
            picked
              ? "border-teal-600 ring-2 ring-teal-200 bg-teal-50"
              : "border-gray-200 bg-white"
          }`}
      >
        <input
          type="radio"
          name="doctor"
          className="hidden"
          checked={picked}
          onChange={onPick}
        />
        <div className="flex gap-4">
          <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100">
            {d?.photo ? (
              <img
                src={d.photo}
                alt={d.accountId.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No Img
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  {d?.accountId.fullName || "—"}
                </div>
                <div className="text-sm text-teal-700">{d?.role || "—"}</div>
              </div>
              {picked && (
                <span className="text-xs px-2 py-1 rounded-full bg-teal-600 text-white">
                  Đã chọn
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              {"rating" in d && (
                <div className="flex items-center gap-2">
                  <StarRating rating={d.rating} />
                  <span className="text-xs text-gray-600">
                    {Number(d.rating || 0).toFixed(1)}
                    {d.reviewsCount ? ` (${d.reviewsCount})` : ""}
                  </span>
                </div>
              )}
              {d?.yearsExperience != null && (
                <span className="text-xs text-gray-600">
                  {d.yearsExperience} năm kinh nghiệm
                </span>
              )}
              {d?.pricePerWeek == null && (
                <span className="text-xs font-medium text-emerald-700">
                  {priceText}400k/tuần
                </span>
              )}
            </div>

            {(d?.specialization?.length || d?.modalities?.length) && (
              <div className="mt-2">
                <div className="text-[13px] text-gray-600 mb-1">
                  Chuyên môn & phương pháp:
                </div>
                <div className="flex flex-wrap">
                  {(d.specializations || []).map((s, i) => (
                    <Badge key={`sp-${i}`}>{s}</Badge>
                  ))}
                  {(d.modalities || []).map((m, i) => (
                    <Badge key={`md-${i}`}>{m}</Badge>
                  ))}
                </div>
              </div>
            )}

            {d?.languages?.length ? (
              <div className="mt-2 text-[13px] text-gray-600">
                Ngôn ngữ:{" "}
                <span className="text-gray-800">{d.languages.join(", ")}</span>
              </div>
            ) : null}

            {d?.gender && (
              <div className="text-[13px] text-gray-600">
                Giới tính: <span className="text-gray-800">{d.gender}</span>
              </div>
            )}

            {d?.bio && (
              <div className="mt-2 text-sm text-gray-700">{d.bio}</div>
            )}

            {topSlots.length > 0 && (
              <div className="mt-3">
                <div className="text-[13px] text-gray-600 mb-1">
                  Lịch trống gần nhất:
                </div>
                <div className="flex flex-wrap gap-2">
                  {topSlots.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      {formatSlot(s)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mở rộng chi tiết */}
            {(d?.certificates?.length || d?.about) && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen((v) => !v);
                }}
                className="mt-3 text-xs text-teal-700 hover:underline"
              >
                {open ? "Ẩn chi tiết ▲" : "Xem chi tiết ▼"}
              </button>
            )}

            {open && (
              <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                {d?.about && (
                  <div className="text-sm text-gray-700 mb-2">{d.about}</div>
                )}
                {d?.certificates?.length ? (
                  <>
                    <div className="text-[13px] text-gray-600">Chứng chỉ:</div>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {d.certificates.map((c, i) => (
                        <li key={i}>
                          {/^https?:\/\//i.test(c) ? (
                            <a
                              className="text-teal-700 underline"
                              href={c}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {c}
                            </a>
                          ) : (
                            c
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </label>
    );
  };

  // -----------------------
  // Screens
  // -----------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-teal-50">
        <div className="animate-pulse text-teal-700">Đang tải bài test…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-red-700">{error}</div>
      </div>
    );
  }
  const hasAll = CODES.every((c) => !!testsMap[c]);
  if (!hasAll) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-amber-800">Thiếu dữ liệu bài test cần thiết.</div>
      </div>
    );
  }

  const phq = testsMap[CODES[0]];
  const gad = testsMap[CODES[1]];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-teal-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header + progress */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-700">
            Bài test & ghép bác sĩ
          </h1>
          <span className="text-sm text-gray-500">
            Bước {step}/{totalSteps}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* B1: PHQ-9 */}
        {step === 1 && phq && <RadioMatrix test={phq} />}

        {/* B2: GAD-7 */}
        {step === 2 && gad && <RadioMatrix test={gad} />}

        {/* B3: Danh sách bác sĩ từ backend (đã mở rộng thông tin) */}
        {step === 3 && (
          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Đề xuất bác sĩ từ hệ thống
            </h3>
            {matchLoading && (
              <div className="text-teal-700">Đang lấy danh sách bác sĩ…</div>
            )}
            {matchError && <div className="text-red-600">{matchError}</div>}
            {!matchLoading && !matchError && (
              <>
                {doctors.length === 0 ? (
                  <div className="text-gray-700">
                    Hiện chưa có đề xuất phù hợp. Bạn vẫn có thể tiếp tục và
                    chúng tôi sẽ liên hệ sau.
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      Chọn một bác sĩ phù hợp từ danh sách dưới đây.
                    </p>
                    {/* Toolbar sắp xếp */}
                    <div className="flex items-center justify-end gap-3 mb-3">
                      <label className="text-sm text-gray-600">Sắp xếp:</label>
                      <select
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white"
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value)}
                      >
                        <option value="best">Phù hợp nhất</option>
                        <option value="rating">Đánh giá cao</option>
                        <option value="experience">Kinh nghiệm cao</option>
                        <option value="priceAsc">Giá ↑</option>
                        <option value="priceDesc">Giá ↓</option>
                        <option value="name">Tên A→Z</option>
                      </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {sortedDoctors.map((d) => (
                        <DoctorCard
                          key={d._id}
                          d={d}
                          picked={pickedDoctorId === d._id}
                          onPick={() => setPickedDoctorId(d._id)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </Card>
        )}

        {/* B4: Review & Submit (hiển thị thêm thông tin bác sĩ đã chọn) */}
        {step === 4 && (
          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Xem lại & xác nhận
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {CODES.map((code) => {
                const t = testsMap[code];
                return (
                  <div key={code} className="p-3 rounded-lg bg-white border">
                    <div className="font-medium text-gray-800">{t.title}</div>
                    <div className="mt-1">
                      Số câu:{" "}
                      <span className="font-semibold">
                        {t.questions?.length || 0}
                      </span>
                    </div>
                    <div className="mt-1">
                      Điểm tạm tính:{" "}
                      <span className="font-semibold">
                        {computed[code]?.score ?? 0}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="md:col-span-2">
                <div className="font-medium text-gray-800 mb-2">
                  Bác sĩ đã chọn:
                </div>
                <div>
                  {pickedDoctorId
                    ? (() => {
                        const d = doctors.find((x) => x._id === pickedDoctorId);
                        if (!d) return "—";
                        return (
                          <div className="flex gap-4 items-start">
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
                              {d?.photo ? (
                                <img
                                  src={d.photo}
                                  alt={d.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900">
                                {d.accountId.fullName}{" "}
                                <span className="text-sm text-teal-700">
                                  ({d.role})
                                </span>
                              </div>
                              <div className="text-xs text-gray-600">
                                {d.yearsExperience != null &&
                                  `${d.yearsExperience} năm KN`}
                                {d.pricePerWeek != null &&
                                  ` • ${formatCurrencyVND(
                                    d.pricePerWeek
                                  )}/tuần`}
                                {d.rating != null &&
                                  ` • ${Number(d.rating).toFixed(1)}★${
                                    d.reviewsCount ? `/${d.reviewsCount}` : ""
                                  }`}
                              </div>
                              {(d?.specialization?.length ||
                                d?.modalities?.length) && (
                                <div className="flex flex-wrap">
                                  {(d.specialization || []).map((s, i) => (
                                    <Badge key={`r-sp-${i}`}>{s}</Badge>
                                  ))}
                                  {(d.modalities || []).map((m, i) => (
                                    <Badge key={`r-md-${i}`}>{m}</Badge>
                                  ))}
                                </div>
                              )}
                              {d?.languages?.length ? (
                                <div className="text-xs text-gray-600">
                                  Ngôn ngữ: {d.languages.join(", ")}
                                </div>
                              ) : null}
                              {d?.bio && (
                                <div className="text-xs text-gray-700">
                                  {d.bio}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    : doctors.length === 0
                    ? "— (Chưa có đề xuất phù hợp)"
                    : "— (chưa chọn)"}
                </div>
              </div>

              <div className="md:col-span-2 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                Lưu ý: Kết quả sàng lọc chỉ để tham khảo. Chẩn đoán & kế hoạch
                điều trị do chuyên gia quyết định.
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={step === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ← Quay lại
          </button>

          {step < 4 ? (
            <button
              onClick={goNext}
              className="px-5 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
            >
              Tiếp tục →
            </button>
          ) : (
            <button
              onClick={submitFinal}
              className="px-5 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
            >
              Gửi xác nhận
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
