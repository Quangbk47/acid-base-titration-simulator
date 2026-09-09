const freezeEntries = (entries) => Object.freeze(entries.map((entry) => Object.freeze(entry)));

export const titrationKnowledge = Object.freeze({
  title: 'Điểm tương đương, điểm kết thúc và đường cong chuẩn độ',
  introduction: 'Ba khái niệm này cùng xuất hiện trong một phép chuẩn độ, nhưng chúng không đồng nghĩa. Hãy dùng đường cong pH–V để liên hệ tính toán hóa học với quan sát trong phòng thí nghiệm.',
  concepts: freezeEntries([
    {
      title: 'Điểm tương đương',
      description: 'Là mốc hóa học mà lượng chất chuẩn vừa đủ phản ứng với chất phân tích theo đúng tỉ lượng phương trình. Với axit–bazơ một nấc: n(H⁺) = n(OH⁻).',
      emphasis: 'Được xác định từ số mol, không từ màu chỉ thị.',
    },
    {
      title: 'Điểm kết thúc',
      description: 'Là mốc thực nghiệm để dừng chuẩn độ: chỉ thị đổi màu bền sau khi lắc đều, hoặc thiết bị cho tín hiệu đã chọn.',
      emphasis: 'Cần nằm gần điểm tương đương, nhưng không bắt buộc trùng khít.',
    },
    {
      title: 'Đường cong chuẩn độ',
      description: 'Là đồ thị pH theo thể tích chất chuẩn đã thêm. Mỗi điểm là một trạng thái cân bằng do chemistry engine tính sau một lần thêm dung dịch.',
      emphasis: 'Giúp nhận ra vùng đệm, đoạn nhảy pH và phần chất chuẩn dư.',
    },
  ]),
  example: Object.freeze({
    title: 'Ví dụ: HCl 0,100 M và NaOH 0,100 M',
    description: 'Khi chuẩn độ 25,00 mL HCl bằng NaOH cùng nồng độ, thể tích tương đương là 25,00 mL: Veq = Ca × Va / Cb. Ở 25 °C, hệ axit mạnh–bazơ mạnh lý tưởng có pH xấp xỉ 7 tại mốc này.',
    note: 'Kết luận pH = 7 không áp dụng cho mọi hệ. Với CH₃COOH–NaOH, CH₃COO⁻ thủy phân nên pH tại tương đương thường lớn hơn 7.',
  }),
  curveRegions: freezeEntries([
    { title: 'Ban đầu', description: 'pH do dung dịch phân tích quyết định.' },
    { title: 'Trước tương đương', description: 'Chất phân tích còn dư; với axit yếu–bazơ mạnh có thể hình thành vùng đệm HA/A⁻.' },
    { title: 'Nửa tương đương', description: 'Với hệ axit yếu–bazơ mạnh, n(HA) = n(A⁻) và pH xấp xỉ pKa khi điều kiện gần đúng phù hợp.' },
    { title: 'Lân cận tương đương', description: 'pH đổi rất nhanh; nên giảm cỡ giọt để tránh thêm quá tay.' },
    { title: 'Sau tương đương', description: 'Chất chuẩn dư chi phối pH; NaOH dư làm dung dịch có tính bazơ.' },
  ]),
  indicator: Object.freeze({
    title: 'Chọn chỉ thị theo đoạn nhảy pH',
    description: 'Vùng chuyển màu của chỉ thị nên nằm trong đoạn pH biến thiên dốc quanh điểm tương đương. Phenolphthalein trong mô phỏng đổi từ không màu sang hồng trong khoảng pH 8,2–10,0.',
    note: 'Nhãn “điểm tương đương” lấy từ solver. Nhãn “điểm kết thúc” lấy từ chỉ thị và quy tắc màu bền; không suy ra nhãn này từ nhãn kia.',
  }),
  checks: freezeEntries([
    { question: 'Với 25,00 mL HCl 0,100 M và NaOH 0,100 M, Veq là bao nhiêu?', answer: '25,00 mL.' },
    { question: 'Nếu màu hồng bền xuất hiện ở 25,10 mL, đó là mốc nào?', answer: 'Điểm kết thúc quan sát được; nó có thể lệch nhẹ so với điểm tương đương 25,00 mL.' },
    { question: 'Vì sao pH tương đương của CH₃COOH–NaOH không nhất thiết bằng 7?', answer: 'CH₃COO⁻ bị thủy phân trong nước, làm dung dịch có tính bazơ.' },
  ]),
});
