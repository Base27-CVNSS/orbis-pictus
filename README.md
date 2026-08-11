# 🌍 Orbis Pictus — Bách khoa trực quan vô hạn bằng AI

<p align="center">
  <strong>Nhập một chủ đề → AI vẽ một trang → chạm vào bất kỳ chi tiết nào → AI vẽ tiếp một trang mới về chính chi tiết đó.</strong>
</p>

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=111" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-%E2%89%A522.5-339933?logo=node.js&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/Gi%E1%BA%A5y%20ph%C3%A9p-MIT-green" />
  <img alt="Vietnamese" src="https://img.shields.io/badge/Giao%20di%E1%BB%87n-Ti%E1%BA%BFng%20Vi%E1%BB%87t-EA2D2E" />
</p>

> **Orbis Pictus không phải trình duyệt web thông thường.** Mỗi “trang” là một **ảnh duy nhất do AI sinh theo thời gian thực**, không phải HTML, không có DOM và cũng không có các liên kết được khai báo sẵn bên trong ảnh.

---

## ✨ Orbis Pictus là gì?

Orbis Pictus xây dựng một cách duyệt tri thức khác với web truyền thống. Người dùng nhập một chủ đề; hệ thống dùng mô hình ngôn ngữ để biên soạn nội dung, sau đó dùng mô hình tạo ảnh để vẽ toàn bộ trang dưới dạng pixel. Khi người dùng chạm vào một đối tượng trên ảnh, hệ thống đánh dấu đúng tọa độ đó, gửi ảnh đã đánh dấu cho mô hình thị giác để nhận diện đối tượng, rồi tạo một trang con mới.

Tên dự án gợi lại *Orbis Sensualium Pictus* của **Jan Amos Comenius**, xuất bản năm 1658 và thường được xem là một trong những sách giáo khoa/bách khoa bằng hình ảnh đầu tiên. Phiên bản này đưa cùng tinh thần “học bằng hình ảnh” vào quy trình sinh nội dung bằng AI.

Dự án là một **open-source homage độc lập** lấy cảm hứng từ `flipbook.page`; không phải sản phẩm chính thức của đội ngũ flipbook.page.

---

## 🚀 Điểm nổi bật

- 🖱️ **Chạm để khám phá vô hạn** — chạm vào vật thể trong ảnh để mở một nhánh nội dung mới.
- 🔎 **Tìm kiếm bằng câu tự nhiên** — nhập bất kỳ chủ đề nào để tạo trang đầu tiên.
- ✏️ **Chỉnh sửa bằng lệnh** — ví dụ: “thêm chi tiết”, “chuyển sang ban đêm”, “bỏ phần chữ”.
- 🌿 **Lịch sử dạng cây/phiên bản** — chỉnh sửa không phá trang cũ mà tạo một phiên bản ngang hàng.
- 🧭 **Breadcrumb theo hành trình** — quay lại, đi tới hoặc nhảy về một nút tổ tiên.
- 🎞️ **Morph chuyển trang** — tùy chọn tạo video chuyển tiếp giữa trang cha và trang con.
- 🌊 **Video chuyển động lặp** — tạo chuyển động nhẹ cho nước, ánh sáng, hơi nước…
- 💾 **Ba lớp cache** — cache nhận diện điểm chạm, tái sử dụng node con và cache ảnh theo hash prompt.
- 🖼️ **Tải ảnh cá nhân** — dùng ảnh của người dùng làm trang gốc để bắt đầu khám phá.
- 🌐 **Web grounding** — có thể dùng tìm kiếm web làm căn cứ thay vì chỉ dựa vào tri thức mô hình.
- 🎨 **Phong cách + góc nhìn tách biệt** — thay đổi style và composition mà không sửa logic nội dung.
- 🇻🇳 **Giao diện Việt hóa** — thanh địa chỉ, trạng thái tạo trang, model settings, phiên bản, demo và tooltip được bản địa hóa.

---

## 🧠 Bản chất kỹ thuật

Một lần tạo trang có thể hình dung như sau:

```text
Người dùng
   │
   ├─ nhập chủ đề ──────────────┐
   │                            │
   └─ chạm lên ảnh              │
          │                     │
          ▼                     │
 Canvas đánh dấu tọa độ         │
          │                     │
          ▼                     │
 VLM nhận diện đối tượng        │
          │                     │
          └──────────────┐      │
                         ▼      ▼
                    LLM biên soạn nội dung
                         │
                         ▼
                  Prompt tạo ảnh
                         │
                         ▼
                Image Provider/API
                         │
                         ▼
                    Ảnh trang mới
                         │
                         ▼
              SQLite + cache + cây trang
```

### Mẹo “tọa độ chạm”

Mô hình thị giác không nhận một tọa độ `(x, y)` rồi tự biết đối tượng nào nằm ở đó. Client vẽ **vòng tròn đỏ + dấu chữ thập trắng** đúng vị trí người dùng chạm lên một canvas, xuất toàn bộ ảnh thành JPEG và gửi ảnh đã đánh dấu cho VLM. VLM chỉ cần trả lời “vật gì nằm dưới dấu này?”.

Đây là lớp cầu nối quan trọng giữa **tọa độ giao diện** và **ngữ nghĩa thị giác**.

### Tách nội dung khỏi phong cách

Kiến trúc dùng hai lớp prompt độc lập:

1. **Content authoring** — tiêu đề, vật thể, nhãn, bố cục nội dung, callout.
2. **Art style/composition** — vật liệu, ánh sáng, bảng màu, phong cách và góc nhìn.

Nhờ đó có thể đổi toàn bộ phong cách hình ảnh mà không làm thay đổi kiến thức hoặc cấu trúc trang.

---

## 🧱 Kiến trúc mã nguồn

```text
orbis-pictus/
├─ apps/
│  ├─ web/                  # React/Vite UI, canvas, điều hướng, cache phía client
│  └─ server/               # API, SSE, pipeline AI, SQLite, lưu ảnh/video
├─ packages/
│  └─ shared/               # Kiểu dữ liệu và contract dùng chung
├─ docs/                    # Demo/hình minh họa/tài liệu
├─ config.example.yml       # Cấu hình provider, model, feature flag
├─ .env.example             # API key và biến môi trường
└─ README.md
```

### API tạo nội dung

Các chế độ chính cùng đi qua endpoint SSE:

```http
POST /api/generate
```

Ba mode cốt lõi:

- `search` — tạo trang từ truy vấn.
- `tap` — tạo trang từ đối tượng được chạm.
- `edit` — tạo phiên bản mới từ lệnh chỉnh sửa.

Luồng SSE điển hình:

```text
start → tap_subject → preview → complete
                         └──────→ error
```

---

## 🤖 Provider hỗ trợ

| Vai trò | Provider |
|---|---|
| LLM biên soạn prompt + VLM nhận diện điểm chạm | Anthropic / API tương thích Anthropic · Google Gemini |
| Tạo ảnh | fal.ai · BytePlus Ark / Seedream · Google Gemini · OpenAI gpt-image |
| Video loop + morph | BytePlus Ark / Seedance |
| Web grounding | Công cụ web-search của provider tương thích Anthropic |

> Model/provider thực tế phụ thuộc API key và cấu hình của bạn. Không nên commit khóa API vào repository.

---

## 🛠️ Cài đặt

### Yêu cầu

- **Node.js 22.5+**
- npm
- Ít nhất một API key LLM thật nếu muốn trải nghiệm đầy đủ

```bash
git clone https://github.com/Base27-CVNSS/orbis-pictus.git
cd orbis-pictus
npm install

cp .env.example .env
cp config.example.yml config.yml
```

Chạy server và web ở hai terminal:

```bash
npm run dev:server
```

```bash
npm run dev:web
```

Sau đó mở:

```text
http://localhost:5173
```

Server mặc định:

```text
http://localhost:8787
```

---

## ⚙️ Cấu hình

Thứ tự ưu tiên cấu hình:

```text
Bảng Model trong trình duyệt
        ↓
Biến môi trường
        ↓
config.yml
        ↓
Giá trị mặc định tích hợp
```

- `.env`: dành cho **bí mật**, đặc biệt API key.
- `config.yml`: dành cho provider, model, feature flag và tham số không bí mật.
- Bảng **⚙ Model**: đổi model ảnh/video cho các trang mới mà không cần khởi động lại giao diện.

---

## 💾 Cache và tối ưu chi phí

Orbis Pictus có ba tầng tái sử dụng chính:

| Tầng | Ý nghĩa |
|---|---|
| Coordinate-grid VLM cache | Chạm gần cùng vị trí có thể dùng lại tên đối tượng đã nhận diện |
| Subject-level child dedup | Cùng subject dưới cùng parent có thể mở lại node đã tồn tại |
| Prompt-hash image cache | Prompt giống nhau có thể dùng lại ảnh đã sinh |

Mục tiêu của cache không chỉ là tăng tốc mà còn **giảm số lần gọi API có tính phí**.

---

## 🧪 Kiểm tra

```bash
npm run typecheck
npm test
npm run build
```

Dự án có các bài test riêng để khóa những “prompt contract” quan trọng như mật độ callout, quy tắc text, giới hạn số phần tử và tính nhất quán giữa prompt nội dung với prompt phong cách.

---

## ⚠️ Giới hạn cần biết

- Nội dung AI có thể sai hoặc bịa; không xem ảnh sinh ra là nguồn dữ kiện tuyệt đối.
- Text trong ảnh phụ thuộc model tạo ảnh; tiếng Việt có dấu có thể chưa ổn định ở một số provider/model.
- Morph/video làm tăng độ trễ và chi phí API.
- Web grounding cải thiện tính cập nhật nhưng không biến mô hình thành nguồn kiểm chứng tuyệt đối.
- Trang là raster image nên khả năng truy cập, chọn văn bản và SEO nội dung khác căn bản so với HTML.

---

## 🛡️ Bảo mật

- Không commit `.env`.
- Không nhúng API key vào mã frontend.
- Nên đặt quota/budget cho các provider ảnh và video.
- Khi triển khai công khai, nên bổ sung rate limit, xác thực và giới hạn kích thước upload.

---

## 📜 Nguồn gốc & giấy phép

Repository `Base27-CVNSS/orbis-pictus` là **fork** của dự án gốc **`0toshigami/orbis-pictus`**.

- Tác giả/giữ bản quyền gốc theo `LICENSE`: **0toshigami**.
- Giấy phép: **MIT License**.
- Bản Việt hóa giữ nguyên thông báo bản quyền và điều kiện MIT của dự án gốc.
- Dự án gốc là một open-source homage độc lập đối với `flipbook.page`; không nên diễn giải rằng flipbook.page phát triển, xác nhận hoặc tài trợ repository này.

---

## 🤝 Đóng góp

Các hướng đóng góp hữu ích:

- hoàn thiện bản địa hóa tiếng Việt còn sót trong lỗi runtime/provider;
- cải thiện khả năng render chữ tiếng Việt trong ảnh;
- thêm provider ảnh/video;
- tối ưu cache và chi phí;
- cải thiện accessibility cho trải nghiệm “image-as-page”;
- bổ sung test cho UI tiếng Việt và prompt localization.

---

<p align="center">
  <strong>Orbis Pictus: thay vì đi theo liên kết có sẵn, bạn chạm vào thế giới và AI vẽ tiếp con đường.</strong>
</p>
