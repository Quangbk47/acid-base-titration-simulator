const freezeEntries = (entries) => Object.freeze(entries.map((entry) => Object.freeze(entry)));

export const titrationKnowledge = Object.freeze({
  title: 'Điểm tương đương, điểm kết thúc và đường cong chuẩn độ',
  introduction: 'Phân biệt mốc hóa học, tín hiệu thực nghiệm và hình dạng pH–V trước khi đọc kết quả mô phỏng.',
  concepts: freezeEntries([
    { title: 'Điểm tương đương', description: 'Mốc số mol chất chuẩn vừa đủ phản ứng theo tỉ lượng.', emphasis: 'Xác định từ stoichiometry, không từ màu chỉ thị.' },
    { title: 'Điểm kết thúc', description: 'Mốc thực nghiệm dựa trên màu bền hoặc tín hiệu thiết bị.', emphasis: 'Cần gần nhưng không bắt buộc trùng điểm tương đương.' },
    { title: 'Đường cong chuẩn độ', description: 'Đồ thị pH theo thể tích chất chuẩn, mỗi điểm do chemistry engine tính.', emphasis: 'Thể hiện vùng đệm, bước nhảy pH và vùng chất chuẩn dư.' },
  ]),
  curveRegions: freezeEntries([
    { title: 'Ban đầu', description: 'pH do dung dịch phân tích quyết định.' },
    { title: 'Trước tương đương', description: 'Chất phân tích còn dư; hệ axit yếu có vùng đệm HA/A⁻.' },
    { title: 'Nửa tương đương', description: 'Với axit yếu–bazơ mạnh, pH xấp xỉ pKa khi phép gần đúng phù hợp.' },
    { title: 'Lân cận tương đương', description: 'pH thay đổi nhanh; nên giảm cỡ giọt.' },
    { title: 'Sau tương đương', description: 'Chất chuẩn dư chi phối pH.' },
  ]),
  indicator: Object.freeze({
    title: 'Chọn chỉ thị theo bước nhảy pH',
    description: 'Phenolphthalein chuyển từ không màu sang hồng trong khoảng pH 8,2–10,0.',
    note: 'Endpoint theo chỉ thị và Veq theo solver là hai nhãn riêng.',
  }),
  modelLimits: freezeEntries([
    { title: 'Nhiệt độ', description: 'Các model hiện tại chỉ hỗ trợ 25 °C với Kw = 10⁻¹⁴.' },
    { title: 'Hoạt độ', description: 'Dùng nồng độ thay cho hoạt độ; sai lệch có thể tăng với dung dịch đậm đặc.' },
    { title: 'Hệ hóa học', description: 'Hỗ trợ HCl–NaOH, CH₃COOH–NaOH, NH₃–HCl; axit yếu–bazơ yếu vẫn deferred.' },
  ]),
});
