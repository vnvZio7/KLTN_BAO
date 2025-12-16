// src/pages/TestAndMatch.jsx
import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { ChevronLeft } from "lucide-react";
import PaymentModal from "../payments/PaymentModal";
import { generateTransactionCode } from "../../utils/helper";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/userContext";
import CombinedQuiz from "./CombinedQuiz";

const CODES = ["PHQ-9", "GAD-7", "THERAPY_MATCH"]; // Thứ tự: PHQ-9 trước, GAD-7 sau

export default function TestAndMatch() {
  const { fetchUser } = useUserContext();
  // Bước: 1 = Quizz (PHQ-9 + GAD-7), 2 = Match, 3 = Review
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [testsMap, setTestsMap] = useState({}); // { code: {code,title,description,questions[]} }
  const [answers, setAnswers] = useState({}); // { code: number[] }
  const [cur, setCur] = useState(0); // chỉ số câu *gộp* toàn bộ quizz

  // Đề xuất bác sĩ
  const [matchLoading, setMatchLoading] = useState(false);
  const [needDoctor, setNeedDoctor] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [suggestedExercises, setSuggestedExercises] = useState([]);
  const [reason, setReason] = useState("");
  const [spec, setSpec] = useState("");
  const [levels, setLevels] = useState([]);
  const [pickedDoctorId, setPickedDoctorId] = useState(null);
  const [sortKey, setSortKey] = useState("best"); // best | rating | experience | priceAsc | priceDesc | name

  const [orderCode, setOrderCode] = useState(null);

  const [open, setOpen] = React.useState(false);

  const token = ""; // ví dụ auth
  const navigate = useNavigate();

  // ---------- Tải bài test ----------
  useEffect(() => {
    let mounted = true;

    const fetchTest = async (code) => {
      try {
        const res = await axiosInstance.get(
          API_PATHS.TESTS.GET_TEST_BY_CODE(code)
        );
        return res.data;
      } catch (err) {
        const message =
          err.response?.data?.message || `Không tải được test ${code}`;
        throw new Error(message);
      }
    };

    (async () => {
      try {
        setLoading(true);
        setError("");
        setOrderCode("");
        setOrderCode(generateTransactionCode());
        const results = {};
        for (const code of CODES) results[code] = await fetchTest(code);
        if (!mounted) return;
        setTestsMap(results);

        // init answers theo từng code
        const init = {};
        for (const code of CODES) {
          const len = results[code]?.questions?.length || 0;
          init[code] = Array(len).fill(null);
        }
        setAnswers(init);
        setCur(0);
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
  }, []);

  // ---------- Gộp câu hỏi của PHQ-9 + GAD-7 ----------
  // Mỗi phần tử: { code, qIndex, q, title, desc }
  const joined = useMemo(() => {
    const arr = [];
    for (const code of CODES) {
      const t = testsMap[code];
      const qs = t?.questions || [];
      qs.forEach((q, i) =>
        arr.push({ code, qIndex: i, q, title: t?.title, desc: t?.description })
      );
    }
    return arr;
  }, [testsMap]);

  const totalAll = joined.length;
  const curEntry = joined[cur] || null;

  // ---------- Điểm tạm (cho Review) ----------
  const computed = useMemo(() => {
    const out = {};
    for (const code of CODES) {
      const t = testsMap[code];
      if (!t) continue;
      const pickedIdx = answers[code] || [];
      const total = pickedIdx.reduce((sum, idx, i) => {
        if (idx == null) return sum;
        const sc = t.questions[i]?.scores?.[idx] ?? 0;
        return sum + sc;
      }, 0);
      out[code] = { score: total, count: pickedIdx.length };
    }
    return out;
  }, [testsMap, answers]);

  // ---------- Khi vào bước 2: gọi backend match bác sĩ ----------
  useEffect(() => {
    const shouldFetch = step === 2 && CODES.every((c) => !!testsMap[c]);
    if (!shouldFetch) return;

    let mounted = true;
    (async () => {
      try {
        setMatchLoading(true);
        setMatchError("");
        // Không tự reset pickedDoctorId nếu user quay lại từ bước 3
        if (pickedDoctorId == null) setPickedDoctorId(null);
        setDoctors([]);
        setSuggestedExercises([]);
        setReason("");
        setNeedDoctor(false);
        setLevels([]);
        setSpec("");

        const payload = {
          tests: CODES.map((code) => ({
            code,
            answers: answers[code],
            scores: (answers[code] || []).map(
              (idx, i) => testsMap[code].questions[i].scores[idx]
            ),
          })),
        };

        const response = await axiosInstance.post(
          API_PATHS.GROQ.GROQ_MATCH_DOCTOR,
          { payload }
        );

        if (!mounted) return;
        const data = response?.data?.doctors || [];
        setReason(response?.data?.reason || "");
        setDoctors(Array.isArray(data) ? data : []);
        setSuggestedExercises(response?.data?.suggestedExercises);
        setLevels({
          "PHQ-9": response?.data?.phqLevel || "",
          "GAD-7": response?.data?.gadLevel || "",
        });
        setNeedDoctor(response?.data?.needDoctor);

        setSpec(response?.data?.spec || "");
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

  // ---------- Helpers UI ----------
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
    const full = Math.floor(r);
    const half = r - full >= 0.25 && r - full < 0.75;
    const total = 5;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => {
          if (i < full)
            return (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                className="w-4 h-4 fill-yellow-400"
              >
                <path d="M10 15l-5.878 3.09L5.5 11.545.5 7.41l6.06-.88L10 1l3.44 5.53 6.06.88-5 4.136 1.378 6.545z" />
              </svg>
            );
          if (i === full && half)
            return (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                className="w-4 h-4"
              >
                <defs>
                  <linearGradient id={`half${i}`}>
                    <stop offset="50%" stopColor="#facc15" />
                    <stop offset="50%" stopColor="#e5e7eb" />
                  </linearGradient>
                </defs>
                <path
                  d="M10 15l-5.878 3.09L5.5 11.545.5 7.41l6.06-.88L10 1l3.44 5.53 6.06.88-5 4.136 1.378 6.545z"
                  fill={`url(#half${i})`}
                />
              </svg>
            );
          return (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              className="w-4 h-4 fill-gray-200"
            >
              <path d="M10 15l-5.878 3.09L5.5 11.545.5 7.41l6.06-.88L10 1l3.44 5.53 6.06.88-5 4.136 1.378 6.545z" />
            </svg>
          );
        })}
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

  // ---------- Quizz gộp (mỗi đáp án 1 dòng, KHÔNG radio, KHÔNG ABCD, KHÔNG css trạng thái đã chọn; chữ căn giữa; nút nhỏ) ----------

  // ---------- Thẻ bác sĩ ----------
  // Card dọc: avatar tròn, tick góc, có label từng phần
  const DoctorCard = ({ d, picked, onPick }) => {
    const [open, setOpen] = useState(false);
    const name = d?.accountId?.fullName || d?.fullName || "—";
    const priceText = formatCurrencyVND(d?.pricePerWeek);
    const specializations = d?.specializations || d?.specialization || [];
    const modalities = d?.modalities || [];

    return (
      <label
        className={`group relative flex flex-col h-full overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
          picked
            ? "border-teal-600 ring-2 ring-teal-200 shadow-md scale-[1.02]"
            : "border-gray-200 hover:-translate-y-[2px] hover:shadow-lg"
        }`}
      >
        <input
          type="radio"
          name="doctor"
          className="sr-only"
          checked={picked}
          onChange={onPick}
        />

        {/* Dấu tick góc khi đã chọn */}
        {picked && (
          <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-7.071 7.071a1 1 0 01-1.414 0L3.293 9.85a1 1 0 011.414-1.415l3.1 3.1 6.364-6.364a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Header: Avatar */}
        <div className="relative flex justify-center pt-6 pb-2">
          <div className="rounded-full p-[3px] bg-gradient-to-br from-teal-400 via-sky-400 to-teal-400">
            <div className="h-20 w-20 rounded-full bg-white overflow-hidden flex items-center justify-center ring-2 ring-white">
              {d?.avatar ? (
                <img
                  src={d.avatar}
                  alt={name}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-base font-semibold text-gray-600">
                    {getInitials(name)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nội dung */}
        <div className="flex-1 px-4 pb-4 text-sm text-gray-700">
          <h3 className="text-base font-semibold text-gray-900 text-center">
            {name}
          </h3>
          {d?.role && (
            <p className="text-center text-teal-700 text-xs mt-0.5">{d.role}</p>
          )}

          {/* Rating & kinh nghiệm */}
          <div className="mt-2 text-center">
            {"rating" in d && (
              <div className="flex justify-center items-center gap-1">
                <StarRating rating={d.rating} />
                <span className="text-xs text-gray-600">
                  {Number(d.rating || 0).toFixed(1)}
                  {d.reviewsCount ? ` (${d.reviewsCount})` : ""}
                </span>
              </div>
            )}
            {d?.yearsExperience != null && (
              <div className="text-xs text-gray-600 mt-1">
                <strong>Kinh nghiệm:</strong> {d.yearsExperience} năm
              </div>
            )}
          </div>

          {/* Giới tính */}
          {d?.gender && (
            <div className="mt-2 text-xs text-gray-600 text-center">
              <strong>Giới tính:</strong> {d.gender}
            </div>
          )}

          {/* Bio ngắn */}
          {d?.bio && (
            <p className="mt-3 line-clamp-2 text-sm text-gray-700 text-center">
              {d.bio}
            </p>
          )}

          {/* Labels: chuyên môn / phương pháp */}
          {(specializations.length > 0 || modalities.length > 0) && (
            <div className="mt-3 space-y-2">
              {specializations.length > 0 && (
                <div>
                  <div className="text-[13px] text-gray-500 mb-1">
                    <strong>Chuyên môn:</strong>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {specializations.map((s, i) => (
                      <span
                        key={`sp-${i}`}
                        className="inline-block rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {modalities.length > 0 && (
                <div>
                  <div className="text-[13px] text-gray-500 mb-1">
                    <strong>Phương pháp trị liệu:</strong>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {modalities.map((m, i) => (
                      <span
                        key={`md-${i}`}
                        className="inline-block rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs text-indigo-700"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer: giá tiền */}
          <div className="mt-4 flex items-center justify-end border-t pt-3">
            {d?.pricePerWeek != null && (
              <span className="text-sm font-semibold text-emerald-700">
                {priceText}/tuần
              </span>
            )}
          </div>
        </div>
      </label>
    );
  };

  // ---------- Hành động bước 2 & 3 ----------
  const goStep2Back = () => {
    // quay lại quizz, đưa con trỏ về câu cuối để người dùng dễ chỉnh
    setStep(1);
    setCur(Math.max(0, totalAll - 1));
    window.scrollTo(0, 0);
  };

  const goStep2Next = () => {
    if (doctors.length > 0 && !pickedDoctorId) {
      alert("Vui lòng chọn một bác sĩ trước khi tiếp tục.");
      return;
    }
    setStep(3);
    window.scrollTo(0, 0);
  };

  const goStep3Back = () => {
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleConfirm = async () => {
    try {
      const { data } = await axiosInstance.get(
        API_PATHS.TRANSACTIONS.GET_TRANSACTION_BY_CODE(orderCode)
      );
      console.log("data: ", data);
      if (data.success) {
        toast.success("Thanh toan thanh cong");
        const response = await axiosInstance.post(API_PATHS.ROOMS.CREATE_ROOM, {
          doctorId: pickedDoctorId._id,
        });
        console.log("response: ", response);

        const roomId = response.data.room._id;
        const transaction = await axiosInstance.patch(
          API_PATHS.TRANSACTIONS.UPDATE_TRANSACTION(data.transaction._id),
          {
            roomId,
            free: true,
          }
        );
        console.log("transaction: ", transaction);

        const testResultPHQ9 = await axiosInstance.post(
          API_PATHS.TEST_RESULTS.CREATE_TEST_RESULTS,
          {
            code: "PHQ-9",
            answers: answers["PHQ-9"],
            totalScore: computed["PHQ-9"]?.score,
            band: levels["PHQ-9"],
          }
        );
        const testResultGAD7 = await axiosInstance.post(
          API_PATHS.TEST_RESULTS.CREATE_TEST_RESULTS,
          {
            code: "GAD-7",
            answers: answers["GAD-7"],
            totalScore: computed["GAD-7"]?.score,
            band: levels["GAD-7"],
          }
        );
        console.log(testResultPHQ9);
        const updateUser = await axiosInstance.patch(
          API_PATHS.USERS.UPDATE_USER,
          {
            testHistory: [
              testResultPHQ9.data.testResult._id,
              testResultGAD7.data.testResult._id,
            ],
            lastPHQ9Score: computed["PHQ-9"]?.score,
            lastGAD7Score: computed["GAD-7"]?.score,
            dominantSymptom: spec,
            doctorIds: doctors,
            currentDoctorId: pickedDoctorId._id,
            walletBalance: pickedDoctorId.pricePerWeek,
          }
        );

        const createAss = await axiosInstance.post(
          API_PATHS.HOMEWORK_ASSIGNMENTS.CREATE_HOMEWORK_ASSIGNMENT_BY_AI,
          {
            suggestedExercises,
          }
        );
        await fetchUser();
        navigate("/user");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // ---------- Render ----------
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-teal-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header tối giản */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-700">
            Bài test & ghép bác sĩ
          </h1>
          <span className="text-sm text-gray-500">Bước {step}/3</span>
        </div>

        {/* B1: Quizz gộp PHQ-9 + GAD-7 (mỗi đáp án 1 dòng, không radio/ABCD/chọn-style) */}
        {step === 1 && (
          <CombinedQuiz
            joined={joined}
            cur={cur}
            setCur={setCur}
            answers={answers}
            onAnswersChange={setAnswers}
            mode="auto" // chọn xong câu cuối -> onFinish
            onFinish={(finalAnswers) => {
              setAnswers(finalAnswers); // đảm bảo state sync
              setStep(2); // sang bước match
              window.scrollTo(0, 0);
            }}
          />
        )}

        {/* B2: Đề xuất bác sĩ — có Quay lại / Tiếp tục */}
        {step === 2 && (
          <>
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  Đề xuất bác sĩ từ hệ thống
                </h3>
                <div className="flex items-center gap-2">
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
              </div>

              {matchLoading && (
                <div className="text-teal-700 mt-2">
                  Đang lấy danh sách bác sĩ…
                </div>
              )}
              {matchError && (
                <div className="text-red-600 mt-2">{matchError}</div>
              )}

              {!matchLoading && !matchError && (
                <>
                  {reason ? (
                    <div className="text-gray-700 mb-4 mt-2">{reason}</div>
                  ) : null}
                  {needDoctor ? (
                    doctors.length === 0 ? (
                      <div className="text-gray-700">
                        Hiện chưa có đề xuất phù hợp. Bạn có thể tiếp tục sang
                        bước tiếp theo.
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {doctors
                          .slice()
                          .sort((a, b) => {
                            switch (sortKey) {
                              case "rating":
                                return (b?.rating ?? 0) - (a?.rating ?? 0);
                              case "experience":
                                return (
                                  (b?.yearsExperience ?? 0) -
                                  (a?.yearsExperience ?? 0)
                                );
                              case "priceAsc":
                                return (
                                  (a?.pricePerWeek ?? Infinity) -
                                  (b?.pricePerWeek ?? Infinity)
                                );
                              case "priceDesc":
                                return (
                                  (b?.pricePerWeek ?? -Infinity) -
                                  (a?.pricePerWeek ?? -Infinity)
                                );
                              case "name": {
                                const an =
                                  a?.accountId?.fullName || a?.fullName || "";
                                const bn =
                                  b?.accountId?.fullName || b?.fullName || "";
                                return an.localeCompare(bn, "vi");
                              }
                              default:
                                return 0; // giữ thứ tự backend
                            }
                          })
                          .map((d) => (
                            <DoctorCard
                              key={d._id}
                              d={d}
                              picked={pickedDoctorId?._id === d._id}
                              onPick={() => setPickedDoctorId(d)}
                            />
                          ))}
                      </div>
                    )
                  ) : (
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          localStorage.clear();
                          navigate("/");
                        }}
                        className="px-5 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
                      >
                        Quay lại trang chủ
                      </button>
                    </div>
                  )}
                </>
              )}
            </Card>

            {/* Actions Bước 2 */}
            <div className="flex items-center justify-between">
              <button
                onClick={goStep2Back}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ← Quay lại
              </button>
              {needDoctor && (
                <button
                  onClick={goStep2Next}
                  className="px-5 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
                >
                  Tiếp tục →
                </button>
              )}
            </div>
          </>
        )}

        {/* B3: Review & Submit — có Quay lại / Tiếp tục (gửi) */}
        {step === 3 && (
          <>
            <Card>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Xem lại & xác nhận
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {CODES.map((code) => {
                  const t = testsMap[code];
                  if (code === "THERAPY_MATCH") return;
                  return (
                    <div key={code} className="p-3 rounded-lg bg-white border">
                      <div className="font-medium text-gray-800">
                        {t.title || code}
                      </div>
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
                      <div className="mt-1">
                        Tình trạng:{" "}
                        <span className="font-semibold">{levels[code]}</span>
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
                          const d = doctors.find(
                            (x) => x._id === pickedDoctorId._id
                          );
                          if (!d) return "—";
                          return (
                            <div className="flex gap-4 items-start">
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
                                {d?.avatar ? (
                                  <img
                                    src={d.avatar}
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
                                    {(d.specializations || []).map((s, i) => (
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

            {/* Actions Bước 3 */}
            <div className="flex items-center justify-between">
              <button
                onClick={goStep3Back}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ← Quay lại
              </button>
              <button
                onClick={() => {
                  setOpen(true);
                }}
                className="px-5 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
              >
                Tiếp tục →
              </button>
            </div>
            <PaymentModal
              open={open}
              onClose={() => setOpen(false)}
              onConfirmed={handleConfirm}
              amount={pickedDoctorId.pricePerWeek}
              orderCode={orderCode}
            />
          </>
        )}
      </div>
    </div>
  );
}
