export const quizQuestions = Object.freeze([
  { question: 'HCl 0,1 M, 25 mL cần bao nhiêu NaOH 0,1 M để tương đương?', options: ['12,5 mL', '25 mL', '50 mL'], correct: 1, explanation: 'n(HCl) = 0,1 × 0,025 = 0,0025 mol. V(NaOH) = 0,0025 / 0,1 = 0,025 L = 25 mL.', pairId: 'hcl-naoh' },
  { question: 'Tại điểm tương đương CH₃COOH–NaOH ở 25 °C, pH thuộc vùng nào?', options: ['Nhỏ hơn 7', 'Luôn bằng 7', 'Lớn hơn 7'], correct: 2, explanation: 'CH₃COO⁻ nhận proton từ nước tạo OH⁻. Vì vậy dung dịch muối có tính bazơ.', pairId: 'acetic-naoh' },
  { question: 'Một mol Ca(OH)₂ đã hòa tan trung hòa được bao nhiêu mol HCl?', options: ['1 mol', '2 mol', '4 mol'], correct: 1, explanation: 'Ca(OH)₂ cung cấp 2 OH⁻. Phương trình: 2HCl + Ca(OH)₂ → CaCl₂ + 2H₂O.', pairId: 'hcl-calcium' },
  { question: 'Chuẩn độ H₂C₂O₄ bằng NaOH có bao nhiêu điểm tương đương theo hệ số phản ứng?', options: ['Một', 'Hai', 'Ba'], correct: 1, explanation: 'Axit oxalic có hai proton có thể trao đổi. V tương đương thứ hai bằng hai lần V thứ nhất.', pairId: 'oxalic-naoh' },
  { question: 'Điểm kết thúc chỉ thị và điểm tương đương có luôn trùng nhau không?', options: ['Có, với mọi chỉ thị', 'Không, phụ thuộc khoảng chuyển màu', 'Chỉ phụ thuộc màu buret'], correct: 1, explanation: 'Điểm tương đương do tỉ lệ mol; điểm kết thúc được nhận biết từ màu chỉ thị. Phenolphthalein chuyển màu khoảng pH 8,2–10.', pairId: 'hcl-naoh' },
]);
export const faqItems = Object.freeze([
  { title: 'Ka, Kb và pKa/pKb', keywords: ['pka', 'pkb', 'ka', 'kb', 'hang so'], answer: 'Ka mô tả cân bằng phân ly axit; Kb mô tả cân bằng nhận proton của bazơ từ nước. Với các hệ cùng điều kiện, hằng số lớn hơn biểu thị phân ly mạnh hơn. pKa = −log₁₀(Ka), pKb = −log₁₀(Kb). Ở 25 °C, Ka × Kb = Kw = 10⁻¹⁴ cho một cặp axit–bazơ liên hợp. Xem giá trị và nguồn trong Tra cứu hóa học.' },
  { title: 'pH và cân bằng', keywords: ['tinh ph', 'ph la', 'ph thay doi'], answer: 'pH = −log₁₀[H⁺] trong mô hình dung dịch lý tưởng. Hệ mạnh sử dụng ion dư ngoài tương đương; hệ yếu và axit hai nấc cần cân bằng phân ly, vật chất và điện tích. Thể tích tăng làm pha loãng dung dịch nên phải dùng tổng thể tích sau trộn.' },
  { title: 'Điểm tương đương', keywords: ['tuong duong', 'equivalence', 'so mol'], answer: 'Điểm tương đương là khi lượng chất chuẩn đạt hệ số mol của phản ứng. Dùng “Dự đoán điểm tương đương” trước khi chạy. pH phụ thuộc cặp chất; chỉ hệ axit mạnh–bazơ mạnh lý tưởng có pH xấp xỉ 7 ở 25 °C.' },
  { title: 'Chỉ thị và điểm kết thúc', keywords: ['chi thi', 'phenolphthalein', 'mau', 'ket thuc'], answer: 'Phenolphthalein không màu ở pH thấp và chuyển hồng khoảng pH 8,2–10. Điểm kết thúc quan sát màu không đồng nghĩa điểm tương đương. Với HCl–NH₃, phenolphthalein không thích hợp để nhận biết tương đương.' },
  { title: 'Reset và điều khiển', keywords: ['reset', 'dat lai', 'dung', 'chay', 'giot'], answer: 'Reset dừng chạy, hủy hiệu ứng cũ, đưa lượng đã nhỏ về 0 mL và nạp lại buret; giữ nguyên thiết lập. Tính trạng thái khởi tạo mô phỏng. Dự đoán chỉ xem lý thuyết và không tiêu hao dung dịch.' },
  { title: 'Hệ hai nấc và độ tan', keywords: ['oxalic', 'hai nac', 'ca(oh)', 'do tan', 'canxi'], answer: 'H₂C₂O₄–NaOH giải đồng thời hai cân bằng axit và điện tích. Ca(OH)₂ cung cấp hai OH⁻ nhưng ít tan: chỉ nhận dung dịch đã hòa tan dưới giới hạn độ tan lý tưởng ở 25 °C. Không mô phỏng huyền phù hoặc kết tủa.' },
  { title: 'Đồ thị và Excel', keywords: ['excel', 'do thi', 'duong cong', 'xlsx', 'du lieu'], answer: 'Có thể đổi điểm/nét liền mà không mất dữ liệu. Đường nối thẳng qua các mẫu, không làm mượt pH gần tương đương. Excel có ba sheet Thông số, Lý thuyết, Dữ liệu pH-V; đây là kết quả mô phỏng, không phải đo thực nghiệm.' },
  { title: 'Giới hạn mô hình', keywords: ['gioi han', 'nhiet do', 'sai so', 'an toan'], answer: 'Mô hình lý tưởng ở 25 °C, bỏ qua hoạt độ ion, CO₂ không khí, sai số thiết bị và động học trộn. Không dùng ứng dụng làm hướng dẫn an toàn thí nghiệm thật; cần quy trình và giám sát của phòng thí nghiệm.' },
]);
export const normalizeSearch = (value) => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c))).trim();
export function faqAnswer(query) {
  const normalized = normalizeSearch(query);
  if (!normalized) return 'Chọn chủ đề hoặc nhập câu hỏi về chuẩn độ.';
  const match = faqItems.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)));
  return match?.answer ?? 'Tôi chưa có câu trả lời trong bộ hướng dẫn theo quy tắc. Hãy chọn một chủ đề bên dưới hoặc trao đổi với giảng viên; không có dịch vụ AI tạo sinh được gọi.';
}
