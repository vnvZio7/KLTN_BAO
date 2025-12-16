// src/pages/RetakeTest.jsx
import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import CombinedQuiz from "./CombinedQuiz";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/userContext";

const CODES = ["PHQ-9", "GAD-7"]; // Thứ tự: PHQ-9 trước, GAD-7 sau

export default function ReTest() {
  const { fetchUser } = useUserContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [testsMap, setTestsMap] = useState({});
  const [answers, setAnswers] = useState({}); // { code: number[] }
  const [submitting, setSubmitting] = useState(false);
  const [cur, setCur] = useState(0); // 👈 thêm
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
  // tải lại bộ câu hỏi (giống bên kia)
  useEffect(() => {
    let mounted = true;

    const fetchTest = async (code) => {
      const res = await axiosInstance.get(
        API_PATHS.TESTS.GET_TEST_BY_CODE(code)
      );
      return res.data;
    };

    (async () => {
      try {
        setLoading(true);
        setError("");

        const results = {};
        for (const code of CODES) {
          results[code] = await fetchTest(code);
        }
        if (!mounted) return;
        setTestsMap(results);

        const init = {};
        for (const code of CODES) {
          const len = results[code]?.questions?.length || 0;
          init[code] = Array(len).fill(null);
        }
        setAnswers(init);
      } catch (e) {
        if (mounted)
          setError(e.response?.data?.message || "Không tải được bài test.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // tính điểm tạm để gửi result
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

  const handleSubmitResult = async () => {
    // check đã trả lời đủ PHQ-9 & GAD-7 chưa (tuỳ bạn muốn strict đến đâu)
    const phqAns = answers["PHQ-9"] || [];
    const gadAns = answers["GAD-7"] || [];
    if (phqAns.some((x) => x == null) || gadAns.some((x) => x == null)) {
      toast.error("Bạn cần trả lời đầy đủ PHQ-9 và GAD-7 trước khi gửi.");
      return;
    }

    try {
      setSubmitting(true);

      // có thể gọi API lấy band theo score nếu backend có; ở đây tạm dùng computed + server tự suy
      const phqRes = await axiosInstance.post(
        API_PATHS.TEST_RESULTS.CREATE_TEST_RESULTS,
        {
          code: "PHQ-9",
          answers: phqAns,
          totalScore: computed["PHQ-9"]?.score,
          // band: ??? nếu muốn để backend tự tính thì bỏ field này
        }
      );
      const gadRes = await axiosInstance.post(
        API_PATHS.TEST_RESULTS.CREATE_TEST_RESULTS,
        {
          code: "GAD-7",
          answers: gadAns,
          totalScore: computed["GAD-7"]?.score,
        }
      );

      // nếu bạn muốn update testHistory user:
      await axiosInstance.patch(API_PATHS.USERS.UPDATE_USER_RETEST, {
        testHistory: [phqRes.data.testResult._id, gadRes.data.testResult._id],
        lastGAD7Score: computed["GAD-7"]?.score,
        lastPHQ9Score: computed["PHQ-9"]?.score,
      });

      fetchUser();
      toast.success("Đã lưu kết quả bài test.");
      navigate("/user"); // hoặc redirect trang nào bạn muốn
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi khi gửi kết quả.");
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-700">
            Làm lại bài test
          </h1>
        </div>

        {/* dùng lại component quiz, nhưng mode = manual để không auto submit */}
        <CombinedQuiz
          joined={joined}
          cur={cur}
          setCur={setCur}
          answers={answers}
          onAnswersChange={setAnswers}
          mode="manual" // không auto submit, để user bấm "Gửi kết quả"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmitResult}
            disabled={submitting}
            className="px-5 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting ? "Đang gửi..." : "Gửi kết quả"}
          </button>
        </div>
      </div>
    </div>
  );
}
