# Prototype Games

Các bản prototype HTML dựng lại để nghiên cứu mechanic game. Mỗi game nằm trong một thư mục riêng.

**Trang chủ:** https://dtungz.github.io/PrototypeGame/

| Game | Chơi | Thư mục |
|---|---|---|
| Perfect Bento | https://dtungz.github.io/PrototypeGame/perfect-bento/ | [`perfect-bento/`](perfect-bento/) |
| Plug It In | https://dtungz.github.io/PrototypeGame/plug-it-in/ | [`plug-it-in/`](plug-it-in/) |

## Thêm một prototype mới
1. Tạo thư mục mới ở gốc repo, tên viết thường, nối bằng dấu gạch ngang (ví dụ `jelly-puzzle/`), có `index.html` bên trong.
2. Thêm một thẻ game vào `index.html` ở gốc và một dòng vào bảng trên.
3. Commit rồi push; GitHub Pages cập nhật sau khoảng 1 phút.

## Chạy trên máy
```bash
python -m http.server 8000
```
Sau đó mở http://localhost:8000.
