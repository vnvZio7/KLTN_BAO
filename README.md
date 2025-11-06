# 🧠 README – Hệ thống đánh giá điểm tâm lý (PHQ-9, GAD-7)

## 1️⃣ Điểm tâm lý là gì

Điểm tâm lý được tính từ các **bài trắc nghiệm tâm lý chuẩn hóa** như **PHQ-9**, **GAD-7**, **DASS-21**, nhằm phản ánh mức độ:

- Trầm cảm
- Lo âu
- Căng thẳng
- Cảm xúc tổng thể của người dùng

| Thang đo    | Mục đích                               |
| ----------- | -------------------------------------- |
| **PHQ-9**   | Đo trầm cảm                            |
| **GAD-7**   | Đo lo âu                               |
| **DASS-21** | Đo stress, lo âu, trầm cảm (tổng quát) |

---

## 2️⃣ Cách tính điểm

### 🔹 PHQ-9 (9 câu)

Mỗi câu có 4 mức điểm:
| Trả lời | Điểm |
|----------|------|
| Không bao giờ | 0 |
| Vài ngày | 1 |
| Hơn nửa số ngày | 2 |
| Gần như mỗi ngày | 3 |

Tổng điểm tối đa: **27**

| Tổng điểm | Mức độ trầm cảm |
| --------- | --------------- |
| 0–4       | Bình thường     |
| 5–9       | Nhẹ             |
| 10–14     | Trung bình      |
| 15–19     | Nặng            |
| 20–27     | Rất nặng        |

### 🔹 GAD-7 (7 câu)

Tổng điểm tối đa: **21**

| Tổng điểm | Mức độ lo âu     |
| --------- | ---------------- |
| 0–4       | Bình thường      |
| 5–9       | Lo âu nhẹ        |
| 10–14     | Lo âu trung bình |
| 15–21     | Lo âu nặng       |

---

## 3️⃣ Ứng dụng điểm tâm lý

- 🔹 **Gợi ý chuyên gia phù hợp**  
  → Điểm trầm cảm cao → _Psychiatrist_  
  → Điểm lo âu cao → _Therapist / Counselor_
- 🔹 **Theo dõi tiến triển tâm lý**  
  → Hiển thị biểu đồ thay đổi điểm theo thời gian.
- 🔹 **Hỗ trợ bác sĩ chẩn đoán**  
  → Bác sĩ xem điểm trước khi tư vấn.
- 🔹 **Đưa ra gợi ý tự chăm sóc**  
  → Ví dụ: “Bạn có dấu hiệu trầm cảm nhẹ, hãy thử bài tập thư giãn hoặc gặp chuyên gia.”

---

## 4️⃣ Khi dùng trong bước đăng nhập

- Lần đầu đăng nhập → hiển thị **16 câu hỏi (PHQ-9 + GAD-7)**.
- Sau khi hoàn thành:
  - Tính điểm từng thang đo.
  - Phân loại mức độ.
  - Gợi ý chuyên gia phù hợp.
  - Lưu kết quả để theo dõi.

---

## 5️⃣ Cách gợi ý bác sĩ theo điểm

### 🔸 Cách 1: Dựa vào **điểm cao hơn**

- Dễ triển khai, giúp xác định hướng điều trị chính.
- Ví dụ:
  - PHQ-9 = 15, GAD-7 = 8 → ưu tiên _Psychiatrist_ (Trầm cảm nặng).
  - GAD-7 = 17, PHQ-9 = 9 → ưu tiên _Therapist_ (Lo âu nặng).

### 🔸 Cách 2: Dựa vào **điểm tổng hợp**

```
TotalScore = (PHQ9 * 0.6) + (GAD7 * 0.4)
```

| Tổng điểm | Mức độ      | Gợi ý bác sĩ     |
| --------- | ----------- | ---------------- |
| 0–4       | Bình thường | Không cần bác sĩ |
| 5–9       | Nhẹ         | Counselor        |
| 10–14     | Trung bình  | Therapist        |
| ≥15       | Nặng        | Psychiatrist     |

### 🔸 Trường hợp “rối loạn kết hợp”

Nếu **PHQ-9 ≥ 15** và **GAD-7 ≥ 15** → _Comorbid Depression + Anxiety_  
➡️ Gợi ý:

- Chính: _Psychiatrist_
- Phụ: _Therapist (CBT)_

---

## 6️⃣ Ví dụ minh họa

Người dùng lần đầu làm bài test:  
→ PHQ-9 = 13, GAD-7 = 16  
→ Lo âu nổi bật hơn → Gợi ý gặp _Therapist_  
→ Sau 3 tuần, điểm giảm: PHQ-9 = 9, GAD-7 = 8  
→ Ghi nhận cải thiện tích cực 🎯

---

## 📊 Kết luận

| Thang đo    | Mục tiêu                    | Sử dụng khi      |
| ----------- | --------------------------- | ---------------- |
| **PHQ-9**   | Trầm cảm                    | Sàng lọc ban đầu |
| **GAD-7**   | Lo âu                       | Sàng lọc ban đầu |
| **DASS-21** | Stress, anxiety, depression | Theo dõi định kỳ |

💡 Kết hợp **PHQ-9 + GAD-7** giúp hệ thống nhanh chóng xác định tình trạng tâm lý và gợi ý chuyên gia phù hợp, là bước nền cho ứng dụng tư vấn tâm lý thông minh.
