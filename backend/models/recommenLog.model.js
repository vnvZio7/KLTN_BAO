// import mongoose from "mongoose";
// // Log gợi ý (bác sĩ, bài tập) để audit và học dần

// const RecommendationLog = new Schema(
//   {
//     type: { type: String, enum: ["doctor", "exercise"] },
//     patientId: { type: ObjectId, ref: "PatientProfile", index: true },
//     input: {
//       testCode: String,
//       totalScore: Number,
//       severity: String,
//       dominantSymptom: String,
//       features: Schema.Types.Mixed, // có thể lưu embedding id hoặc vectorId
//     },
//     outputs: [
//       {
//         targetId: ObjectId, // doctorId hoặc templateId
//         score: Number, // độ phù hợp do AI tính
//         reasons: [String],
//       },
//     ],
//     modelInfo: {
//       provider: String, // "Groq", "Vertex", ...
//       model: String,
//       latencyMs: Number,
//     },
//   },
//   { timestamps: true }
// );
