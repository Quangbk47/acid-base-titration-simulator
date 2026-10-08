// Selected aqueous constants at 25 °C; provenance and exceptional conditions are explicit.
export const SOURCES = Object.freeze({
  "acids": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
  "bases": "https://openstax.org/books/chemistry-2e/pages/i-ionization-constants-of-weak-bases",
  "solubility": "https://openstax.org/books/chemistry-2e/pages/j-solubility-products",
  "strength": "https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases",
  "textbook": "https://www.webassign.net/blb12/a-table-d.pdf",
  "umbc": "https://userpages.umbc.edu/~dfrey1/acidbase.htm",
  "boric": "https://www.industrialchemicals.gov.au/sites/default/files/Boric%20acid%20and%20precursors%20to%20boric%20acid_%20Environment%20tier%20II%20assessment.pdf",
  "carbonic": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5747581/",
  "hydrazine": "https://pubs.acs.org/doi/10.1021/ic990674e",
  "urea": "https://pubs.acs.org/doi/10.1021/jp9804493"
});
export const KW_25 = 1e-14;
const records = [
  {
    "id": "hcl",
    "name": "Axit clohydric",
    "formula": "HCl",
    "category": "acid",
    "strength": "strong",
    "kind": "Axit mạnh",
    "steps": 1,
    "equation": "HCl → H⁺ + Cl⁻",
    "notes": "Phân ly hoàn toàn trong mô hình dung dịch loãng.",
    "source": "https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases",
    "englishName": "Hydrochloric acid",
    "formulaAscii": "HCl",
    "protonCapacity": 1,
    "equilibria": [
      {
        "step": 1,
        "equation": "HCl → H⁺ + Cl⁻",
        "constantKey": null,
        "mode": "strong"
      }
    ],
    "alternatives": []
  },
  {
    "id": "naoh",
    "name": "Natri hiđroxit",
    "formula": "NaOH",
    "category": "base",
    "strength": "strong",
    "kind": "Bazơ mạnh",
    "steps": 1,
    "equation": "NaOH → Na⁺ + OH⁻",
    "notes": "Một mol cung cấp một mol OH⁻.",
    "source": "https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases",
    "englishName": "Sodium hydroxide",
    "formulaAscii": "NaOH",
    "protonCapacity": 1,
    "equilibria": [
      {
        "step": 1,
        "equation": "NaOH → Na⁺ + OH⁻",
        "constantKey": null,
        "mode": "strong"
      }
    ],
    "alternatives": []
  },
  {
    "id": "acetic",
    "name": "Axit axetic",
    "formula": "CH₃COOH",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "Ka": 0.000018,
    "equation": "CH₃COOH ⇌ H⁺ + CH₃COO⁻",
    "notes": "Muối axetat thủy phân; pH tương đương lớn hơn 7.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "englishName": "Acetic acid",
    "formulaAscii": "CH3COOH",
    "protonCapacity": 1,
    "equilibria": [
      {
        "step": 1,
        "equation": "CH₃COOH ⇌ H⁺ + CH₃COO⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "alternatives": []
  },
  {
    "id": "ammonia",
    "name": "Amoniac",
    "formula": "NH₃",
    "category": "base",
    "strength": "weak",
    "kind": "Bazơ yếu",
    "steps": 1,
    "Kb": 0.000018,
    "equation": "NH₃ + H₂O ⇌ NH₄⁺ + OH⁻",
    "notes": "NH₄⁺ là axit liên hợp; pH tương đương với HCl nhỏ hơn 7.",
    "source": "https://openstax.org/books/chemistry-2e/pages/i-ionization-constants-of-weak-bases",
    "englishName": "Ammonia",
    "formulaAscii": "NH3",
    "protonCapacity": 1,
    "equilibria": [
      {
        "step": 1,
        "equation": "NH₃ + H₂O ⇌ NH₄⁺ + OH⁻",
        "constantKey": "Kb",
        "mode": "equilibrium"
      }
    ],
    "alternatives": []
  },
  {
    "id": "oxalic",
    "name": "Axit oxalic",
    "formula": "H₂C₂O₄",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu hai nấc",
    "steps": 2,
    "Ka1": 0.06,
    "Ka2": 0.000061,
    "equation": "H₂C₂O₄ ⇌ H⁺ + HC₂O₄⁻; HC₂O₄⁻ ⇌ H⁺ + C₂O₄²⁻",
    "notes": "Hai điểm tương đương. Giải đồng thời cân bằng điện tích và phân bố hai nấc.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "englishName": "Oxalic acid",
    "formulaAscii": "H2C2O4",
    "protonCapacity": 2,
    "equilibria": [
      {
        "step": 1,
        "equation": "H₂C₂O₄ ⇌ H⁺ + HC₂O₄⁻",
        "constantKey": "Ka1",
        "mode": "equilibrium"
      },
      {
        "step": 2,
        "equation": "HC₂O₄⁻ ⇌ H⁺ + C₂O₄²⁻",
        "constantKey": "Ka2",
        "mode": "equilibrium"
      }
    ],
    "alternatives": [
      {
        "key": "Ka1",
        "value": 0.059,
        "temperatureC": 25,
        "source": "https://www.webassign.net/blb12/a-table-d.pdf",
        "notes": "Giá trị đối chiếu BLB; không dùng trong phép tính."
      },
      {
        "key": "Ka2",
        "value": 0.000064,
        "temperatureC": 25,
        "source": "https://www.webassign.net/blb12/a-table-d.pdf",
        "notes": "Giá trị đối chiếu BLB; không dùng trong phép tính."
      }
    ]
  },
  {
    "id": "calcium",
    "name": "Canxi hiđroxit",
    "formula": "Ca(OH)₂",
    "category": "base",
    "strength": "strong",
    "kind": "Bazơ mạnh, ít tan",
    "steps": 1,
    "Ksp": 0.0000013,
    "equation": "Ca(OH)₂ → Ca²⁺ + 2OH⁻",
    "notes": "Hai mol OH⁻ mỗi mol. Chỉ mô phỏng dung dịch đã hòa tan, không mô phỏng huyền phù.",
    "source": "https://openstax.org/books/chemistry-2e/pages/j-solubility-products",
    "englishName": "Calcium hydroxide",
    "formulaAscii": "Ca(OH)2",
    "protonCapacity": 2,
    "equilibria": [
      {
        "step": 1,
        "equation": "Ca(OH)₂ → Ca²⁺ + 2OH⁻",
        "constantKey": null,
        "mode": "strong"
      }
    ],
    "alternatives": [
      {
        "key": "Ksp",
        "value": 0.0000065,
        "temperatureC": 25,
        "source": "https://www.webassign.net/blb12/a-table-d.pdf",
        "notes": "Giá trị đối chiếu BLB; không dùng trong phép tính."
      }
    ]
  },
  {
    "id": "hydrazoic",
    "name": "Axit hiđrazoic",
    "englishName": "Hydrazoic acid",
    "formula": "HN₃",
    "formulaAscii": "HN3",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Ka": 0.000025,
    "equation": "HN₃ ⇌ H⁺ + N₃⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "HN₃ ⇌ H⁺ + N₃⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "alternatives": [
      {
        "key": "Ka",
        "value": 0.000019,
        "temperatureC": 25,
        "source": "https://www.webassign.net/blb12/a-table-d.pdf",
        "notes": "Giá trị đối chiếu BLB; không dùng trong phép tính."
      }
    ]
  },
  {
    "id": "hydrofluoric",
    "name": "Axit flohiđric",
    "englishName": "Hydrofluoric acid",
    "formula": "HF",
    "formulaAscii": "HF",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Ka": 0.00064,
    "equation": "HF ⇌ H⁺ + F⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "HF ⇌ H⁺ + F⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "alternatives": [
      {
        "key": "Ka",
        "value": 0.00068,
        "temperatureC": 25,
        "source": "https://www.webassign.net/blb12/a-table-d.pdf",
        "notes": "Giá trị đối chiếu BLB; không dùng trong phép tính."
      }
    ]
  },
  {
    "id": "hydrocyanic",
    "name": "Axit xianhiđric",
    "englishName": "Hydrocyanic acid",
    "formula": "HCN",
    "formulaAscii": "HCN",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Ka": 4.9e-10,
    "equation": "HCN ⇌ H⁺ + CN⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "HCN ⇌ H⁺ + CN⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "alternatives": []
  },
  {
    "id": "hypochlorous",
    "name": "Axit hipoclorơ",
    "englishName": "Hypochlorous acid",
    "formula": "HClO",
    "formulaAscii": "HClO",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Ka": 2.9e-8,
    "equation": "HClO ⇌ H⁺ + ClO⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "HClO ⇌ H⁺ + ClO⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "aliases": [
      "HOCl"
    ],
    "alternatives": [
      {
        "key": "Ka",
        "value": 3e-8,
        "temperatureC": 25,
        "source": "https://www.webassign.net/blb12/a-table-d.pdf",
        "notes": "Giá trị đối chiếu BLB; không dùng trong phép tính."
      }
    ]
  },
  {
    "id": "chlorous",
    "name": "Axit clorơ",
    "englishName": "Chlorous acid",
    "formula": "HClO₂",
    "formulaAscii": "HClO2",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Ka": 0.011,
    "equation": "HClO₂ ⇌ H⁺ + ClO₂⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "HClO₂ ⇌ H⁺ + ClO₂⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://www.webassign.net/blb12/a-table-d.pdf",
    "alternatives": []
  },
  {
    "id": "nitrous",
    "name": "Axit nitrơ",
    "englishName": "Nitrous acid",
    "formula": "HNO₂",
    "formulaAscii": "HNO2",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Ka": 0.00046,
    "equation": "HNO₂ ⇌ H⁺ + NO₂⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "HNO₂ ⇌ H⁺ + NO₂⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "alternatives": [
      {
        "key": "Ka",
        "value": 0.00045,
        "temperatureC": 25,
        "source": "https://www.webassign.net/blb12/a-table-d.pdf",
        "notes": "Giá trị đối chiếu BLB; không dùng trong phép tính."
      }
    ]
  },
  {
    "id": "sulfide",
    "name": "Axit sunfuhiđric",
    "englishName": "Hydrogen sulfide",
    "formula": "H₂S",
    "formulaAscii": "H2S",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 2,
    "protonCapacity": 2,
    "Ka1": 8.9e-8,
    "Ka2": 1e-19,
    "equation": "H₂S ⇌ H⁺ + HS⁻; HS⁻ ⇌ H⁺ + S²⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "H₂S ⇌ H⁺ + HS⁻",
        "constantKey": "Ka1",
        "mode": "equilibrium"
      },
      {
        "step": 2,
        "equation": "HS⁻ ⇌ H⁺ + S²⁻",
        "constantKey": "Ka2",
        "mode": "equilibrium"
      }
    ],
    "notes": "Chọn nhất quán bảng OpenStax: Ka₂ = 10⁻¹⁹. Một số bảng cũ ghi khoảng 10⁻¹³; không trộn hai bộ dữ liệu.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "alternatives": [
      {
        "key": "Ka1",
        "value": 9.5e-8,
        "temperatureC": 25,
        "source": "https://www.webassign.net/blb12/a-table-d.pdf",
        "notes": "Giá trị đối chiếu BLB; không dùng trong phép tính."
      }
    ]
  },
  {
    "id": "sulfurous",
    "name": "Axit sunfurơ",
    "englishName": "Sulfurous acid",
    "formula": "H₂SO₃",
    "formulaAscii": "H2SO3",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 2,
    "protonCapacity": 2,
    "Ka1": 0.016,
    "Ka2": 6.4e-8,
    "equation": "H₂SO₃ ⇌ H⁺ + HSO₃⁻; HSO₃⁻ ⇌ H⁺ + SO₃²⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "H₂SO₃ ⇌ H⁺ + HSO₃⁻",
        "constantKey": "Ka1",
        "mode": "equilibrium"
      },
      {
        "step": 2,
        "equation": "HSO₃⁻ ⇌ H⁺ + SO₃²⁻",
        "constantKey": "Ka2",
        "mode": "equilibrium"
      }
    ],
    "notes": "H₂SO₃ là biểu diễn quy ước hệ SO₂ hòa tan/hydrat hóa; Ka₁ là hằng số biểu kiến của hệ nước, không dùng cho pha khí.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "alternatives": [
      {
        "key": "Ka1",
        "value": 0.017,
        "temperatureC": 25,
        "source": "https://www.webassign.net/blb12/a-table-d.pdf",
        "notes": "Giá trị đối chiếu BLB; không dùng trong phép tính."
      }
    ]
  },
  {
    "id": "sulfuric",
    "name": "Axit sunfuric",
    "englishName": "Sulfuric acid",
    "formula": "H₂SO₄",
    "formulaAscii": "H2SO4",
    "category": "acid",
    "strength": "strong",
    "kind": "Axit mạnh ở nấc 1, yếu ở nấc 2",
    "steps": 2,
    "protonCapacity": 2,
    "Ka2": 0.012,
    "equation": "H₂SO₄ → H⁺ + HSO₄⁻; HSO₄⁻ ⇌ H⁺ + SO₄²⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "H₂SO₄ → H⁺ + HSO₄⁻",
        "constantKey": null,
        "mode": "strong"
      },
      {
        "step": 2,
        "equation": "HSO₄⁻ ⇌ H⁺ + SO₄²⁻",
        "constantKey": "Ka2",
        "mode": "equilibrium"
      }
    ],
    "notes": "Nấc 1 phân ly mạnh trong nước; nấc 2 có Ka₂ hữu hạn. Không thay hai nấc bằng hai proton phân ly hoàn toàn.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "alternatives": []
  },
  {
    "id": "carbonic",
    "name": "Axit cacbonic",
    "englishName": "Carbonic acid",
    "formula": "H₂CO₃",
    "formulaAscii": "H2CO3",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 2,
    "protonCapacity": 2,
    "Ka1": 4.3e-7,
    "Ka2": 4.7e-11,
    "equation": "H₂CO₃* ⇌ H⁺ + HCO₃⁻; HCO₃⁻ ⇌ H⁺ + CO₃²⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "H₂CO₃* ⇌ H⁺ + HCO₃⁻",
        "constantKey": "Ka1",
        "mode": "equilibrium"
      },
      {
        "step": 2,
        "equation": "HCO₃⁻ ⇌ H⁺ + CO₃²⁻",
        "constantKey": "Ka2",
        "mode": "equilibrium"
      }
    ],
    "notes": "Ka₁ biểu kiến dùng H₂CO₃* = CO₂(aq) + H₂CO₃; không phải Ka nội tại của H₂CO₃ tinh khiết. Ka₂ mô tả HCO₃⁻. Không ghép Ka₂ = 5,6×10⁻¹¹ từ bảng BLB với bộ OpenStax.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "contextSource": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5747581/",
    "alternatives": [
      {
        "key": "Ka2",
        "value": 5.6e-11,
        "temperatureC": 25,
        "source": "https://www.webassign.net/blb12/a-table-d.pdf",
        "notes": "Giá trị đối chiếu BLB; không dùng trong phép tính."
      }
    ]
  },
  {
    "id": "phosphoric",
    "name": "Axit photphoric",
    "englishName": "Phosphoric acid",
    "formula": "H₃PO₄",
    "formulaAscii": "H3PO4",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 3,
    "protonCapacity": 3,
    "Ka1": 0.0075,
    "Ka2": 6.2e-8,
    "Ka3": 4.2e-13,
    "equation": "H₃PO₄ ⇌ H⁺ + H₂PO₄⁻; H₂PO₄⁻ ⇌ H⁺ + HPO₄²⁻; HPO₄²⁻ ⇌ H⁺ + PO₄³⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "H₃PO₄ ⇌ H⁺ + H₂PO₄⁻",
        "constantKey": "Ka1",
        "mode": "equilibrium"
      },
      {
        "step": 2,
        "equation": "H₂PO₄⁻ ⇌ H⁺ + HPO₄²⁻",
        "constantKey": "Ka2",
        "mode": "equilibrium"
      },
      {
        "step": 3,
        "equation": "HPO₄²⁻ ⇌ H⁺ + PO₄³⁻",
        "constantKey": "Ka3",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "alternatives": []
  },
  {
    "id": "boric",
    "name": "Axit boric",
    "englishName": "Boric acid",
    "formula": "H₃BO₃",
    "formulaAscii": "H3BO3",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Ka": 5.4e-10,
    "equation": "B(OH)₃ + H₂O ⇌ B(OH)₄⁻ + H⁺",
    "equilibria": [
      {
        "step": 1,
        "equation": "B(OH)₃ + H₂O ⇌ B(OH)₄⁻ + H⁺",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Axit Lewis: B(OH)₃ nhận OH⁻ từ nước. Ba nhóm OH không có nghĩa là axit cho ba proton; trong mô hình nước này chỉ có một cân bằng tạo H⁺. Giá trị chọn từ OpenStax, không ghép pKa ở điều kiện khác.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "aliases": [
      "B(OH)3"
    ],
    "mechanism": "Lewis",
    "contextSource": "https://www.industrialchemicals.gov.au/sites/default/files/Boric%20acid%20and%20precursors%20to%20boric%20acid_%20Environment%20tier%20II%20assessment.pdf",
    "alternatives": [
      {
        "key": "Ka",
        "value": 5.8e-10,
        "temperatureC": 25,
        "source": "https://www.webassign.net/blb12/a-table-d.pdf",
        "notes": "Giá trị đối chiếu BLB; không dùng trong phép tính."
      }
    ]
  },
  {
    "id": "formic",
    "name": "Axit fomic",
    "englishName": "Formic acid",
    "formula": "HCOOH",
    "formulaAscii": "HCOOH",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Ka": 0.00018,
    "equation": "HCOOH ⇌ H⁺ + HCOO⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "HCOOH ⇌ H⁺ + HCOO⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "alternatives": []
  },
  {
    "id": "propionic",
    "name": "Axit propionic",
    "englishName": "Propionic acid",
    "formula": "CH₃CH₂COOH",
    "formulaAscii": "CH3CH2COOH",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Ka": 0.000013,
    "equation": "CH₃CH₂COOH ⇌ H⁺ + CH₃CH₂COO⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "CH₃CH₂COOH ⇌ H⁺ + CH₃CH₂COO⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://www.webassign.net/blb12/a-table-d.pdf",
    "aliases": [
      "Propanoic acid",
      "C2H5COOH"
    ],
    "alternatives": []
  },
  {
    "id": "benzoic",
    "name": "Axit benzoic",
    "englishName": "Benzoic acid",
    "formula": "C₆H₅COOH",
    "formulaAscii": "C6H5COOH",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Ka": 0.000063,
    "equation": "C₆H₅COOH ⇌ H⁺ + C₆H₅COO⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "C₆H₅COOH ⇌ H⁺ + C₆H₅COO⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Chọn BLB, bảng D.1 ở 25 °C: Ka = 6,3×10⁻⁵, pKa = 4,20066. UMBC ghi pKa = 4,19 ở 25 °C; hiển thị pKa suy từ giá trị Ka đã chọn, không ghép hai nguồn.",
    "source": "https://www.webassign.net/blb12/a-table-d.pdf",
    "contextSource": "https://userpages.umbc.edu/~dfrey1/acidbase.htm",
    "alternatives": [
      {
        "key": "pKa",
        "value": 4.19,
        "temperatureC": 25,
        "source": "https://userpages.umbc.edu/~dfrey1/acidbase.htm",
        "notes": "Giá trị đối chiếu; giữ Ka của BLB và pKa suy từ Ka đó."
      }
    ]
  },
  {
    "id": "chloroacetic",
    "name": "Axit cloaxetic",
    "englishName": "Chloroacetic acid",
    "formula": "CH₂ClCOOH",
    "formulaAscii": "CH2ClCOOH",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Ka": 0.0014,
    "equation": "CH₂ClCOOH ⇌ H⁺ + CH₂ClCOO⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "CH₂ClCOOH ⇌ H⁺ + CH₂ClCOO⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://www.webassign.net/blb12/a-table-d.pdf",
    "alternatives": []
  },
  {
    "id": "trichloroacetic",
    "name": "Axit tricloaxetic",
    "englishName": "Trichloroacetic acid",
    "formula": "CCl₃COOH",
    "formulaAscii": "CCl3COOH",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "equation": "CCl₃COOH ⇌ H⁺ + CCl₃COO⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "CCl₃COOH ⇌ H⁺ + CCl₃COO⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Đổi từ pKa trong bảng UMBC, không lấy Ka ở nhiệt độ không rõ từ bảng khác.",
    "source": "https://userpages.umbc.edu/~dfrey1/acidbase.htm",
    "verification": "derived",
    "referencePka": 0.7,
    "derivation": "Ka = 10^(−pKa), với pKa = 0,70 tại 25 °C.",
    "alternatives": []
  },
  {
    "id": "lactic",
    "name": "Axit lactic",
    "englishName": "Lactic acid",
    "formula": "CH₃CH(OH)COOH",
    "formulaAscii": "CH3CH(OH)COOH",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Ka": 0.00014,
    "equation": "CH₃CH(OH)COOH ⇌ H⁺ + CH₃CH(OH)COO⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "CH₃CH(OH)COOH ⇌ H⁺ + CH₃CH(OH)COO⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://www.webassign.net/blb12/a-table-d.pdf",
    "alternatives": []
  },
  {
    "id": "phenol",
    "name": "Phenol",
    "englishName": "Phenol",
    "formula": "C₆H₅OH",
    "formulaAscii": "C6H5OH",
    "category": "acid",
    "strength": "weak",
    "kind": "Axit yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Ka": 1.3e-10,
    "equation": "C₆H₅OH ⇌ H⁺ + C₆H₅O⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "C₆H₅OH ⇌ H⁺ + C₆H₅O⁻",
        "constantKey": "Ka",
        "mode": "equilibrium"
      }
    ],
    "notes": "Phenol là axit rất yếu trong nước, không phải bazơ vì có nhóm OH.",
    "source": "https://www.webassign.net/blb12/a-table-d.pdf",
    "alternatives": []
  },
  {
    "id": "methylamine",
    "name": "Metylamin",
    "englishName": "Methylamine",
    "formula": "CH₃NH₂",
    "formulaAscii": "CH3NH2",
    "category": "base",
    "strength": "weak",
    "kind": "Bazơ yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Kb": 0.00044,
    "equation": "CH₃NH₂ + H₂O ⇌ CH₃NH₃⁺ + OH⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "CH₃NH₂ + H₂O ⇌ CH₃NH₃⁺ + OH⁻",
        "constantKey": "Kb",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://openstax.org/books/chemistry-2e/pages/i-ionization-constants-of-weak-bases",
    "alternatives": []
  },
  {
    "id": "ethylamine",
    "name": "Etylamin",
    "englishName": "Ethylamine",
    "formula": "C₂H₅NH₂",
    "formulaAscii": "C2H5NH2",
    "category": "base",
    "strength": "weak",
    "kind": "Bazơ yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Kb": 0.00064,
    "equation": "C₂H₅NH₂ + H₂O ⇌ C₂H₅NH₃⁺ + OH⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "C₂H₅NH₂ + H₂O ⇌ C₂H₅NH₃⁺ + OH⁻",
        "constantKey": "Kb",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://www.webassign.net/blb12/a-table-d.pdf",
    "alternatives": []
  },
  {
    "id": "dimethylamine",
    "name": "Đimetylamin",
    "englishName": "Dimethylamine",
    "formula": "(CH₃)₂NH",
    "formulaAscii": "(CH3)2NH",
    "category": "base",
    "strength": "weak",
    "kind": "Bazơ yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Kb": 0.00059,
    "equation": "(CH₃)₂NH + H₂O ⇌ (CH₃)₂NH₂⁺ + OH⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "(CH₃)₂NH + H₂O ⇌ (CH₃)₂NH₂⁺ + OH⁻",
        "constantKey": "Kb",
        "mode": "equilibrium"
      }
    ],
    "notes": "Chọn OpenStax Kb = 5,9×10⁻⁴. BLB ghi 5,4×10⁻⁴ ở 25 °C; giữ từng bộ dữ liệu riêng.",
    "source": "https://openstax.org/books/chemistry-2e/pages/i-ionization-constants-of-weak-bases",
    "contextSource": "https://www.webassign.net/blb12/a-table-d.pdf",
    "alternatives": [
      {
        "key": "Kb",
        "value": 0.00054,
        "temperatureC": 25,
        "source": "https://www.webassign.net/blb12/a-table-d.pdf",
        "notes": "Giá trị đối chiếu BLB; không dùng trong phép tính."
      }
    ]
  },
  {
    "id": "trimethylamine",
    "name": "Trimetylamin",
    "englishName": "Trimethylamine",
    "formula": "(CH₃)₃N",
    "formulaAscii": "(CH3)3N",
    "category": "base",
    "strength": "weak",
    "kind": "Bazơ yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Kb": 0.000063,
    "equation": "(CH₃)₃N + H₂O ⇌ (CH₃)₃NH⁺ + OH⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "(CH₃)₃N + H₂O ⇌ (CH₃)₃NH⁺ + OH⁻",
        "constantKey": "Kb",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://openstax.org/books/chemistry-2e/pages/i-ionization-constants-of-weak-bases",
    "alternatives": [
      {
        "key": "Kb",
        "value": 0.000064,
        "temperatureC": 25,
        "source": "https://www.webassign.net/blb12/a-table-d.pdf",
        "notes": "Giá trị đối chiếu BLB; không dùng trong phép tính."
      }
    ]
  },
  {
    "id": "aniline",
    "name": "Anilin",
    "englishName": "Aniline",
    "formula": "C₆H₅NH₂",
    "formulaAscii": "C6H5NH2",
    "category": "base",
    "strength": "weak",
    "kind": "Bazơ yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Kb": 4.3e-10,
    "equation": "C₆H₅NH₂ + H₂O ⇌ C₆H₅NH₃⁺ + OH⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "C₆H₅NH₂ + H₂O ⇌ C₆H₅NH₃⁺ + OH⁻",
        "constantKey": "Kb",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://openstax.org/books/chemistry-2e/pages/i-ionization-constants-of-weak-bases",
    "alternatives": []
  },
  {
    "id": "pyridine",
    "name": "Piriđin",
    "englishName": "Pyridine",
    "formula": "C₅H₅N",
    "formulaAscii": "C5H5N",
    "category": "base",
    "strength": "weak",
    "kind": "Bazơ yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Kb": 1.7e-9,
    "equation": "C₅H₅N + H₂O ⇌ C₅H₅NH⁺ + OH⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "C₅H₅N + H₂O ⇌ C₅H₅NH⁺ + OH⁻",
        "constantKey": "Kb",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://www.webassign.net/blb12/a-table-d.pdf",
    "alternatives": []
  },
  {
    "id": "hydrazine",
    "name": "Hiđrazin",
    "englishName": "Hydrazine",
    "formula": "N₂H₄",
    "formulaAscii": "N2H4",
    "category": "base",
    "strength": "weak",
    "kind": "Bazơ yếu",
    "steps": 2,
    "protonCapacity": 2,
    "Kb": 0.0000013,
    "equation": "N₂H₄ + H₂O ⇌ N₂H₅⁺ + OH⁻; N₂H₅⁺ + H₂O ⇌ N₂H₆²⁺ + OH⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "N₂H₄ + H₂O ⇌ N₂H₅⁺ + OH⁻",
        "constantKey": "Kb",
        "mode": "equilibrium"
      },
      {
        "step": 2,
        "equation": "N₂H₅⁺ + H₂O ⇌ N₂H₆²⁺ + OH⁻",
        "constantKey": "Kb2",
        "mode": "pending"
      }
    ],
    "notes": "Kb đã xác minh cho nấc nhận proton đầu. Nấc 2: cần xác minh Kb₂ trong dung dịch loãng. Nghiên cứu proton hóa ở lực ion 0,5–1 M không được tự chuyển thành hằng số dung dịch loãng.",
    "source": "https://www.webassign.net/blb12/a-table-d.pdf",
    "contextSource": "https://pubs.acs.org/doi/10.1021/ic990674e",
    "pendingConstants": [
      "Kb2"
    ],
    "verification": "partial",
    "alternatives": []
  },
  {
    "id": "hydroxylamine",
    "name": "Hiđroxylamin",
    "englishName": "Hydroxylamine",
    "formula": "HONH₂",
    "formulaAscii": "HONH2",
    "category": "base",
    "strength": "weak",
    "kind": "Bazơ yếu",
    "steps": 1,
    "protonCapacity": 1,
    "Kb": 1.1e-8,
    "equation": "HONH₂ + H₂O ⇌ HONH₃⁺ + OH⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "HONH₂ + H₂O ⇌ HONH₃⁺ + OH⁻",
        "constantKey": "Kb",
        "mode": "equilibrium"
      }
    ],
    "notes": "Hằng số cân bằng trong nước; không đồng nghĩa với một mô hình chuẩn độ đã được hỗ trợ.",
    "source": "https://www.webassign.net/blb12/a-table-d.pdf",
    "aliases": [
      "NH2OH"
    ],
    "alternatives": []
  },
  {
    "id": "urea",
    "name": "Urê",
    "englishName": "Urea",
    "formula": "CO(NH₂)₂",
    "formulaAscii": "CO(NH2)2",
    "category": "base",
    "strength": "weak",
    "kind": "Bazơ yếu",
    "steps": 1,
    "protonCapacity": 1,
    "equation": "CO(NH₂)₂ + H⁺ ⇌ [CO(NH₂)₂H]⁺",
    "equilibria": [
      {
        "step": 1,
        "equation": "CO(NH₂)₂ + H⁺ ⇌ [CO(NH₂)₂H]⁺",
        "constantKey": "Kb",
        "mode": "pending"
      }
    ],
    "notes": "Cần xác minh Kb trong nước ở 25 °C. UMBC ghi pKa axit liên hợp 0,10 tại 21 °C; không dùng Kw ở 25 °C để đổi. Ái lực proton/độ bazơ pha khí không phải Kb trong nước. Proton hóa ưu tiên tại O; phương trình chỉ viết tổng quát.",
    "source": "https://userpages.umbc.edu/~dfrey1/acidbase.htm",
    "contextSource": "https://pubs.acs.org/doi/10.1021/jp9804493",
    "temperatureC": null,
    "verification": "pending",
    "pendingConstants": [
      "Kb"
    ],
    "alternatives": []
  },
  {
    "id": "carbonate",
    "name": "Ion cacbonat",
    "englishName": "Carbonate ion",
    "formula": "CO₃²⁻",
    "formulaAscii": "CO3^2-",
    "category": "base",
    "strength": "weak",
    "kind": "Bazơ yếu",
    "steps": 2,
    "protonCapacity": 2,
    "equation": "CO₃²⁻ + H₂O ⇌ HCO₃⁻ + OH⁻; HCO₃⁻ + H₂O ⇌ H₂CO₃* + OH⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "CO₃²⁻ + H₂O ⇌ HCO₃⁻ + OH⁻",
        "constantKey": "Kb",
        "mode": "equilibrium"
      },
      {
        "step": 2,
        "equation": "HCO₃⁻ + H₂O ⇌ H₂CO₃* + OH⁻",
        "constantKey": "Kb2",
        "mode": "equilibrium"
      }
    ],
    "notes": "Nấc đầu nhận một proton tạo HCO₃⁻. HCO₃⁻ lưỡng tính; nấc sau dùng tổng CO₂(aq)+H₂CO₃ biểu kiến, không chỉ một loài H₂CO₃. Đây không phải mô hình chuẩn độ cacbonat hoàn chỉnh.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "ion": true,
    "charge": -2,
    "verification": "derived",
    "conjugateAcidId": "carbonic",
    "derivation": "Kb = Kw/Ka₂(H₂CO₃); Kb₂ biểu kiến = Kw/Ka₁(H₂CO₃*), Kw = 10⁻¹⁴ ở 25 °C.",
    "alternatives": []
  },
  {
    "id": "acetate",
    "name": "Ion axetat",
    "englishName": "Acetate ion",
    "formula": "CH₃COO⁻",
    "formulaAscii": "CH3COO-",
    "category": "base",
    "strength": "weak",
    "kind": "Bazơ yếu",
    "steps": 1,
    "protonCapacity": 1,
    "equation": "CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻",
    "equilibria": [
      {
        "step": 1,
        "equation": "CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻",
        "constantKey": "Kb",
        "mode": "equilibrium"
      }
    ],
    "notes": "Bazơ liên hợp của axit axetic. Kb nhỏ nhưng không bằng 0; không tự kích hoạt một cặp chuẩn độ mới.",
    "source": "https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids",
    "ion": true,
    "charge": -1,
    "verification": "derived",
    "conjugateAcidId": "acetic",
    "derivation": "Kb = Kw/Ka(CH₃COOH), với Kw = 10⁻¹⁴ ở 25 °C.",
    "alternatives": []
  }
];

const keys = ['Ka', 'Kb', 'Ka1', 'Ka2', 'Ka3', 'Kb1', 'Kb2', 'Ksp'];
export const chemicals = Object.freeze(records.map((item) => {
  // Derived values follow the selected conjugate-acid record, not copied literals.
  const find = (id) => records.find((record) => record.id === id);
  if (item.id === 'carbonate') item = { ...item, Kb: KW_25 / find('carbonic').Ka2, Kb2: KW_25 / find('carbonic').Ka1 };
  if (item.id === 'acetate') item = { ...item, Kb: KW_25 / find('acetic').Ka };
  if (item.id === 'trichloroacetic') item = { ...item, Ka: 10 ** (-item.referencePka) };
  const pValues = Object.fromEntries(keys.filter((key) => Number.isFinite(item[key]) && item[key] > 0 && key !== 'Ksp').map((key) => ['p' + key, -Math.log10(item[key])]));
  return Object.freeze({ temperatureC: 25, medium: 'Nước, dung dịch loãng; lực ion không quy định trong bảng giáo khoa.', verification: 'verified', ...item, aliases: Object.freeze(item.aliases ?? []), ...pValues, alternatives: Object.freeze(item.alternatives.map((alternative) => Object.freeze(alternative))), pendingConstants: Object.freeze(item.pendingConstants ?? []), equilibria: Object.freeze(item.equilibria.map((step) => Object.freeze(step))) });
}));
export const chemicalById = (id) => chemicals.find((item) => item.id === id);
export const calciumSolubilityM = Math.cbrt(chemicalById('calcium').Ksp / 4);
export const constantEntries = (chemical) => keys.filter((key) => Number.isFinite(chemical[key]) && chemical[key] > 0).map((key) => ({ key, value: chemical[key], pValue: chemical['p' + key] ?? null }));
export const constantDescription = (chemical) => constantEntries(chemical).map(({ key, value, pValue }) => key + ' = ' + value.toExponential(2) + (pValue === null ? '' : '; p' + key + ' = ' + pValue.toFixed(3))).join(' · ') || (chemical.verification === 'pending' ? 'Cần xác minh Ka/Kb trong nước ở 25 °C.' : 'Phân ly hoàn toàn; không dùng Ka/Kb hữu hạn.');
