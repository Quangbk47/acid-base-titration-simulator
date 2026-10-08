# Kiểm kê và mở rộng thư viện axit–bazơ

Ngày 09/10/2026. Chỉ làm local; không commit/push/deploy/đổi production. Đã bảo toàn 36 file hiện có trong tmp/acid-base-library-baseline, bản sao .bak.

## Giai đoạn 1 — kiểm kê trước sửa

Có 6 chất, 5 cặp khác nhau và 6 lựa chọn/chiều chuẩn độ. Các hằng số thực dùng có nguồn 25 °C; pK hiển thị được suy ra nhưng chưa có field lưu trong record. Oxalic đã có Ka1/Ka2 riêng. Chưa có tên tiếng Anh, giao diện chọn chi tiết hoặc status hỗ trợ từng chất; lọc mạnh/yếu đã có.

| Công thức yêu cầu | Đã có | Ka/Kb | pKa/pKb | Nguồn | Mô phỏng |
| --- | --- | --- | --- | --- | --- |
| HN3 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| HF | Chưa | — | — | Chưa | Chưa có trong thư viện |
| HCN | Chưa | — | — | Chưa | Chưa có trong thư viện |
| HClO | Chưa | — | — | Chưa | Chưa có trong thư viện |
| HClO2 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| HNO2 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| H2S | Chưa | — | — | Chưa | Chưa có trong thư viện |
| H2SO3 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| H2SO4 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| H2CO3 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| H3PO4 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| H3BO3 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| HCOOH | Chưa | — | — | Chưa | Chưa có trong thư viện |
| CH3COOH | Có | Ka | Suy ra −log10, chưa lưu field | Có | Có thể mô phỏng |
| CH3CH2COOH | Chưa | — | — | Chưa | Chưa có trong thư viện |
| C6H5COOH | Chưa | — | — | Chưa | Chưa có trong thư viện |
| CH2ClCOOH | Chưa | — | — | Chưa | Chưa có trong thư viện |
| CCl3COOH | Chưa | — | — | Chưa | Chưa có trong thư viện |
| CH3CH(OH)COOH | Chưa | — | — | Chưa | Chưa có trong thư viện |
| H2C2O4 | Có | Ka1, Ka2 | Suy ra −log10, chưa lưu field | Có | Có thể mô phỏng |
| C6H5OH | Chưa | — | — | Chưa | Chưa có trong thư viện |
| NH3 | Có | Kb | Suy ra −log10, chưa lưu field | Có | Có thể mô phỏng |
| CH3NH2 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| C2H5NH2 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| (CH3)2NH | Chưa | — | — | Chưa | Chưa có trong thư viện |
| (CH3)3N | Chưa | — | — | Chưa | Chưa có trong thư viện |
| C6H5NH2 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| C5H5N | Chưa | — | — | Chưa | Chưa có trong thư viện |
| N2H4 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| HONH2 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| CO(NH2)2 | Chưa | — | — | Chưa | Chưa có trong thư viện |
| CO3^2- | Chưa | — | — | Chưa | Chưa có trong thư viện |
| CH3COO- | Chưa | — | — | Chưa | Chưa có trong thư viện |
| HCl | Có | — | — | Có | Có thể mô phỏng |
| NaOH | Có | — | — | Có | Có thể mô phỏng |
| Ca(OH)2 | Có | — | — | Có | Có thể mô phỏng |

Không có record trùng trong 6 chất. Một Ka=1.8e-5 còn lặp trong weakAcidCases: sẽ thay bằng tham chiếu danh mục, giữ nguyên giá trị. Các literals trong test fixture là đối chiếu độc lập, không gộp vào engine. Trường steps của Ca(OH)2 trước đây mô tả 2 đương lượng OH⁻, không phải 2 nấc phân ly: sẽ phân biệt dung lượng proton và số cân bằng trong UI.

## Kế hoạch bổ sung

1. Giữ ID và hằng số của 6 chất cũ, bổ sung 30 chất chưa có, mỗi giá trị có nguồn/điều kiện.
2. Dữ liệu nhiều nấc có trường riêng và array cân bằng; pK được tính từ K để tránh lệch làm tròn. H2SO4 nấc mạnh không dùng Infinity; boric là Lewis, không giả ba proton.
3. Ion acetate/carbonate dùng Kw/Ka của axit liên hợp từ cùng danh mục. Urea không công bố Kb 25 °C khi chưa chốt ý nghĩa/điều kiện.
4. Chi tiết tương tác, tên Việt/Anh/công thức, đa nấc/ion filters; link chỉ tới cặp đã kiểm thử.
5. Unit dữ liệu, browser library/mobile, toàn bộ regression và build. Không mở thêm các cặp mô phỏng.

## Kết quả triển khai

Trước sửa: **6 chất**. Bổ sung **30 chất**, tổng **36** mục tra cứu. Có **5 cặp hóa học / 6 chiều lựa chọn** mô phỏng, giữ nguyên danh sách: HCl–NaOH, CH₃COOH–NaOH, NH₃–HCl / HCl–NH₃, H₂C₂O₄–NaOH, HCl–Ca(OH)₂. Các chất mới **chỉ tra cứu**; có K không tự kích hoạt mô hình.

Tổng 40 hằng số hữu hạn: **35 Ka/Kb đối chiếu trực tiếp**, **1 Ksp giữ nguyên từ OpenStax**, **4 giá trị suy ra** (Ka tricloaxetic; Kb axetat; Kb và Kb₂ biểu kiến cacbonat). 39 pKa/pKb được suy từ −log₁₀K bằng số thực, chỉ làm tròn khi hiển thị. Mọi hằng số công bố cùng điều kiện 25 °C; không dùng nhiệt độ của nguồn urea để gán Kb 25 °C.

Dữ liệu có trường Ka1/Ka2/Ka3 và array equilibria riêng, nguồn và điều kiện ngay trong record. Kb liên hợp được tính lúc nạp từ Ka đã chọn và KW_25; không lưu bản sao số dễ lệch. Nồng độ/thể tích không hardcode trong phép tính của engine; thông số của link thử chỉ là ví dụ có thể sửa trên form.

| Công thức | Tên Anh | Cân bằng trình bày | K và pK chọn dùng | Nguồn | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| HCl | Hydrochloric acid | 1 | Phân ly mạnh; không gán K hữu hạn | OpenStax 14.3 | Có thể mô phỏng |
| NaOH | Sodium hydroxide | 1 | Phân ly mạnh; không gán K hữu hạn | OpenStax 14.3 | Có thể mô phỏng |
| CH₃COOH | Acetic acid | 1 | Ka=1.8000e-5 / pKa=4.7447 | OpenStax H | Có thể mô phỏng |
| NH₃ | Ammonia | 1 | Kb=1.8000e-5 / pKb=4.7447 | OpenStax I | Có thể mô phỏng |
| H₂C₂O₄ | Oxalic acid | 2 | Ka1=6.0000e-2 / pKa1=1.2218<br>Ka2=6.1000e-5 / pKa2=4.2147 | OpenStax H | Có thể mô phỏng |
| Ca(OH)₂ | Calcium hydroxide | 1 | Ksp=1.3000e-6 | OpenStax J | Có thể mô phỏng |
| HN₃ | Hydrazoic acid | 1 | Ka=2.5000e-5 / pKa=4.6021 | OpenStax H | Chỉ tra cứu |
| HF | Hydrofluoric acid | 1 | Ka=6.4000e-4 / pKa=3.1938 | OpenStax H | Chỉ tra cứu |
| HCN | Hydrocyanic acid | 1 | Ka=4.9000e-10 / pKa=9.3098 | OpenStax H | Chỉ tra cứu |
| HClO | Hypochlorous acid | 1 | Ka=2.9000e-8 / pKa=7.5376 | OpenStax H | Chỉ tra cứu |
| HClO₂ | Chlorous acid | 1 | Ka=1.1000e-2 / pKa=1.9586 | BLB D | Chỉ tra cứu |
| HNO₂ | Nitrous acid | 1 | Ka=4.6000e-4 / pKa=3.3372 | OpenStax H | Chỉ tra cứu |
| H₂S | Hydrogen sulfide | 2 | Ka1=8.9000e-8 / pKa1=7.0506<br>Ka2=1.0000e-19 / pKa2=19.0000 | OpenStax H | Chỉ tra cứu |
| H₂SO₃ | Sulfurous acid | 2 | Ka1=1.6000e-2 / pKa1=1.7959<br>Ka2=6.4000e-8 / pKa2=7.1938 | OpenStax H | Chỉ tra cứu |
| H₂SO₄ | Sulfuric acid | 2 | Ka2=1.2000e-2 / pKa2=1.9208 | OpenStax H | Chỉ tra cứu |
| H₂CO₃ | Carbonic acid | 2 | Ka1=4.3000e-7 / pKa1=6.3665<br>Ka2=4.7000e-11 / pKa2=10.3279 | OpenStax H | Chỉ tra cứu |
| H₃PO₄ | Phosphoric acid | 3 | Ka1=7.5000e-3 / pKa1=2.1249<br>Ka2=6.2000e-8 / pKa2=7.2076<br>Ka3=4.2000e-13 / pKa3=12.3768 | OpenStax H | Chỉ tra cứu |
| H₃BO₃ | Boric acid | 1 | Ka=5.4000e-10 / pKa=9.2676 | OpenStax H | Chỉ tra cứu |
| HCOOH | Formic acid | 1 | Ka=1.8000e-4 / pKa=3.7447 | OpenStax H | Chỉ tra cứu |
| CH₃CH₂COOH | Propionic acid | 1 | Ka=1.3000e-5 / pKa=4.8861 | BLB D | Chỉ tra cứu |
| C₆H₅COOH | Benzoic acid | 1 | Ka=6.3000e-5 / pKa=4.2007 | BLB D | Chỉ tra cứu |
| CH₂ClCOOH | Chloroacetic acid | 1 | Ka=1.4000e-3 / pKa=2.8539 | BLB D | Chỉ tra cứu |
| CCl₃COOH | Trichloroacetic acid | 1 | Ka=1.9953e-1 / pKa=0.7000 | UMBC | Chỉ tra cứu |
| CH₃CH(OH)COOH | Lactic acid | 1 | Ka=1.4000e-4 / pKa=3.8539 | BLB D | Chỉ tra cứu |
| C₆H₅OH | Phenol | 1 | Ka=1.3000e-10 / pKa=9.8861 | BLB D | Chỉ tra cứu |
| CH₃NH₂ | Methylamine | 1 | Kb=4.4000e-4 / pKb=3.3565 | OpenStax I | Chỉ tra cứu |
| C₂H₅NH₂ | Ethylamine | 1 | Kb=6.4000e-4 / pKb=3.1938 | BLB D | Chỉ tra cứu |
| (CH₃)₂NH | Dimethylamine | 1 | Kb=5.9000e-4 / pKb=3.2291 | OpenStax I | Chỉ tra cứu |
| (CH₃)₃N | Trimethylamine | 1 | Kb=6.3000e-5 / pKb=4.2007 | OpenStax I | Chỉ tra cứu |
| C₆H₅NH₂ | Aniline | 1 | Kb=4.3000e-10 / pKb=9.3665 | OpenStax I | Chỉ tra cứu |
| C₅H₅N | Pyridine | 1 | Kb=1.7000e-9 / pKb=8.7696 | BLB D | Chỉ tra cứu |
| N₂H₄ | Hydrazine | 2 | Kb=1.3000e-6 / pKb=5.8861 | BLB D | Chỉ tra cứu |
| HONH₂ | Hydroxylamine | 1 | Kb=1.1000e-8 / pKb=7.9586 | BLB D | Chỉ tra cứu |
| CO(NH₂)₂ | Urea | 1 | Cần xác minh | UMBC | Chỉ tra cứu |
| CO₃²⁻ | Carbonate ion | 2 | Kb=2.1277e-4 / pKb=3.6721<br>Kb2=2.3256e-8 / pKb2=7.6335 | OpenStax H | Chỉ tra cứu |
| CH₃COO⁻ | Acetate ion | 1 | Kb=5.5556e-10 / pKb=9.2553 | OpenStax H | Chỉ tra cứu |

### Quy ước và dữ liệu chưa chốt

- **Urea:** chưa công bố Kb/pKb nước 25 °C. UMBC ghi pKa của axit liên hợp 0,10 ở **21 °C**; không chuyển bằng Kw 25 °C. Nghiên cứu ái lực proton pha khí không phải Kb nước. Hiển thị “Cần xác minh”, không có link mô phỏng.
- **Hydrazine:** Kb nấc đầu = 1,3×10⁻⁶ đã đối chiếu BLB. Có thể nhận proton thứ hai nhưng **Kb₂ dung dịch loãng chưa xác minh**. Nghiên cứu Inorganic Chemistry 1999 về proton hóa N₂H₅⁺ ở lực ion 0,5/1 M không được ghép vào bảng dung dịch loãng.
- **H₂SO₄:** nấc 1 mạnh, không gán Infinity hoặc một Ka giả; nấc 2 Ka₂=1,2×10⁻².
- **H₃BO₃:** một cân bằng Lewis nhận OH⁻; không giả ba nấc từ ba nhóm OH.
- **H₂CO₃:** Ka₁ biểu kiến áp dụng tổng CO₂(aq)+H₂CO₃, ký hiệu H₂CO₃*. Kb₂ của cacbonat dùng cùng quy ước; HCO₃⁻ lưỡng tính. Đây chưa phải engine chuẩn độ cacbonat đầy đủ.
- **H₂SO₃:** biểu diễn quy ước hệ SO₂ hòa tan/hydrat hóa, không phải hằng số pha khí.
- **H₂S:** chọn Ka₂=10⁻¹⁹ của OpenStax/BLB; không dùng giá trị khoảng 10⁻¹³ trong một số bảng cũ. Chưa mở mô hình chuẩn độ H₂S.
- **Benzoic:** chọn BLB Ka=6,3×10⁻⁵, pKa=4,20065945 (hiển thị 4,2007); UMBC pKa=4,19 được lưu riêng, không ghép với Ka chọn dùng.
- Các giá trị đối chiếu BLB khác OpenStax được lưu trong alternatives, có nguồn/nhiệt độ và nhãn **không dùng trong phép tính**: HN₃, HF, HClO, HNO₂, H₂S nấc 1, H₂SO₃ nấc 1, H₂CO₃ nấc 2, boric, oxalic, dimethylamine, trimethylamine, Ca(OH)₂. Không lấy trung bình hay âm thầm đổi dữ liệu đang dùng.
- Steps của Ca(OH)₂ được chỉnh nghĩa metadata từ 2 đương lượng sang **1 cân bằng và 2 đương lượng OH⁻/mol**; engine không đọc trường steps và các kết quả không đổi.

### Nguồn đã đối chiếu

1. [OpenStax Chemistry 2e, H: axit ở 25 °C](https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids).
2. [OpenStax Chemistry 2e, I: bazơ ở 25 °C](https://openstax.org/books/chemistry-2e/pages/i-ionization-constants-of-weak-bases).
3. [OpenStax J: tích số tan](https://openstax.org/books/chemistry-2e/pages/j-solubility-products) và [14.3: mạnh/yếu, cặp liên hợp](https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases).
4. [Brown–LeMay–Bursten, Chemistry: The Central Science 12e, bảng D.1/D.2 (WebAssign PDF)](https://www.webassign.net/blb12/a-table-d.pdf): benzoic, chloroacetic, chlorous, lactic, phenol, propionic, ethylamine, hydrazine và hydroxylamine.
5. [UMBC: bảng dissociation constants](https://userpages.umbc.edu/~dfrey1/acidbase.htm): tricloaxetic pKa 0,70 ở 25 °C; đối chiếu benzoic; urea 21 °C không dùng làm Kb 25 °C.
6. [Chính phủ Australia, boric acid assessment](https://www.industrialchemicals.gov.au/sites/default/files/Boric%20acid%20and%20precursors%20to%20boric%20acid_%20Environment%20tier%20II%20assessment.pdf): cơ chế Lewis, không lấy hằng số khác điều kiện để ghép bảng.
7. [How Acidic Is Carbonic Acid?](https://pmc.ncbi.nlm.nih.gov/articles/PMC5747581/): phân biệt hằng số biểu kiến và nội tại.
8. [Inorganic Chemistry 1999, protonation constant of N₂H₅⁺](https://pubs.acs.org/doi/10.1021/ic990674e): lực ion cụ thể, không tự suy Kb₂ loãng.
9. [Proton Affinity and Gas-Phase Basicity of Urea](https://pubs.acs.org/doi/10.1021/jp9804493): pha khí không phải hằng số nước.

Các phương trình/giải thích giáo dục được viết cho ứng dụng theo quy tắc; không sao chép hình hoặc đoạn văn giáo trình, không gọi dịch vụ AI bên ngoài.

## Kiểm thử và bảo toàn chức năng

- npm run check: lint/format đạt; **118/118 unit và regression tests PASS** (109 cũ + 9 mới).
- npm run audit: **8/8 nhóm PASS**, bao phủ phases 0–6; đây là runner tích hợp dự án, không phải npm dependency audit.
- Browser thư viện: **4 nhóm PASS**; 36 công thức, 8 bộ lọc, Việt/Anh/Unicode/ion, no-results, chi tiết từng nấc, collapse/focus, urea/hydrazine chưa xác minh, chuyển acetic/oxalic/calcium và refresh, 320/375/768/1440 px và chạm thật qua emulation.
- Toàn bộ **5 browser suite cũ PASS**: instructor (9 nhóm), research (5 nhóm), titration audit (7 mốc thể tích), vessel3d (camera/touch/8 widths/WebGL fallback), security (XSS/input/report/không gọi tài nguyên ngoài). Đồ thị, màu dung dịch, buret/bình và engine cùng state, không mất chức năng.
- Firestore **demo Emulator local 2/2 nhóm PASS**: quyền owner/UID bất biến và đọc published/admin writes. Không đổi Rules, không đọc dữ liệu production.
- Build local đạt, chỉ tài nguyên web trong dist; chưa deploy. release metadata báo base commit 85a314a26d63558788a79d83044d7249c41988ed và dirty=true, không tự nhận là phiên bản đã xuất bản.
- Đối chiếu before.json: IDs, công thức, nguồn và mọi Ka/Kb/Ka1/Ka2/Ksp của 6 chất cũ không đổi. Một Ka trùng ở standardCases đã thay bằng chemicalById('acetic').Ka cùng giá trị.
- Một assertion browser ban đầu nhầm công thức giải thích “pKb = −log₁₀Kb” là pKb số của urea; sửa test chỉ cấm pKb **số** chưa xác minh. Không đổi dữ liệu để đạt PASS.

Bằng chứng local (được gitignore): tmp/acid-base-library-qa/check.log, library-results.json, emulator.log, before.json, phosphoric-desktop.png, phosphoric-mobile.png; các suite cũ ghi bằng chứng tại thư mục QA tương ứng.

## File thay đổi trong lượt bổ sung này

- src/data/chemicals.js: danh mục 36 mục, provenance, các nấc, dẫn xuất, pending và alternatives.
- src/data/standardCases.js: dùng chung Ka axetic; giữ nguyên kết quả.
- src/ui/chemicalLibraryView.js (mới): tìm/lọc/chi tiết/giải thích/link hỗ trợ.
- src/ui/homeView.js: gọi module thư viện, giữ quick prediction/quiz/FAQ.
- index.html, assets/styles.css: filters, detail region, style responsive theo palette cũ.
- tests/chemical-library.test.js và tests/chemical-library.browser.mjs (mới).
- tests/research-upgrade.test.js và tests/research-upgrade.browser.mjs: cập nhật **chỉ số lượng/bộ lọc** vì phạm vi danh mục tăng; giữ mọi assertion engine/simulation/quiz/xlsx cũ.
- docs/ACID_BASE_LIBRARY.md (báo cáo này).

Các thay đổi trước lượt này được giữ nguyên, có bản sao .bak trong tmp/acid-base-library-baseline. Không sửa module chemistry solver, simulation, Three.js, đồ thị, Firestore/Hosting production trong lượt bổ sung này. Không cài thêm dependency.

## Giới hạn và điều cần xác nhận

Không cần phê duyệt để xem/thử bản local tại http://localhost:4173/#chemical-library. Nếu muốn công bố Kb urea hoặc Kb₂ hydrazine, cần chọn nguồn hằng số nước/cùng nhiệt độ và quy ước rõ ràng trước; hiện giữ “Cần xác minh”. Việc mở thêm cặp chuẩn độ cần engine và kiểm thử riêng, không nằm trong danh mục tra cứu này. Commit/push/deploy vẫn chờ lệnh riêng của người dùng; production và lịch sử Git giữ nguyên.
