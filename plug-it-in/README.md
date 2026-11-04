# Plug It In: prototype HTML

Bản dựng lại game web *Plug It In* (Sam Feng & Jose Salas) từ video gameplay `E:\Video\2026-11-04 01-34-45.mp4`, gồm 15 level giống trong video.

## Chạy
- **Chơi online:** https://dtungz.github.io/PrototypeGame/plug-it-in/
- Trên máy: nhấp đúp `index.html`, hoặc chạy `python -m http.server 8000` trong thư mục này rồi mở `http://localhost:8000`.
- Tự đổi bố cục theo màn hình. **Điện thoại (dọc):** khung 9:16, lưới 10x13, nút ↻ ♪ ⌂ và tên level ở trên cùng, phích chờ xếp thành nhiều hàng ở đáy. **Máy tính (ngang):** khung 16:9 giống video. Xoay máy giữa chừng thì level được dựng lại theo khung mới.
- Chơi bằng chuột hoặc cảm ứng. Không cần asset ngoài: hình vẽ bằng canvas, âm thanh tổng hợp bằng WebAudio.

## File
| File | Nội dung |
|---|---|
| `index.html` | Toàn bộ game trong **một file duy nhất**: level data (khối `==LEVELS-BEGIN==` … `==LEVELS-END==`), luật cắm, render, kéo thả, UI, âm thanh. Gửi riêng file này cũng chơi được |
| `tools/solve.js` | Solver vét cạn: `node tools/solve.js [level]` kiểm tra level có giải được không (thêm biến môi trường `PORTRAIT=1` để kiểm tra với lưới dọc 10x13) |

## Luật (rút ra từ video)
1. **Kéo** phích để di chuyển, **chạm** để xoay 90° theo chiều kim đồng hồ.
2. Chân phích phải khớp lỗ ổ cắm cả về hình lẫn hướng. Có 3 kiểu: `2` (••), `3` (mặt cười: 2 mắt + miệng), `4` (dấu +). Phích sẽ vừa ổ nếu mọi chân đều rơi vào lỗ, nên phích 2 chân cắm được ổ 3 hoặc 4 lỗ khi đúng hướng.
3. Phích có kích thước 1x1 đến 2x3 / 1x4. Thân phích được phép che ổ khác và nằm ngoài bảng, nhưng **chỉ được đè lên phích mà nó đang cắm vào** (trực tiếp hoặc gián tiếp).
4. **Phích có thêm ổ** (từ level 8): trên thân có ổ để cắm chồng phích khác. Rút phích mẹ ra thì các phích con rơi theo.
5. Thắng khi **mọi phích đều có điện**: popup "Everyone is happy!". Không cần dùng hết ổ.
6. Level 15 là màn credits dạng sandbox: cắm hết phích thì có phích mới xuất hiện.

## Định dạng level (khối `==LEVELS-BEGIN==` trong `index.html`)
```js
{ bg: [r,g,b], tip: "text",
  panel: [[x, y, type, rot], ...],          // type "2"|"3"|"4" hoặc "x" = tấm trống
  plugs: [{ w, h, pin: [px, py, type, rot], sockets: [[sx, sy, type, rot]] }] }
```
`rot` là số lần xoay 90° theo chiều kim đồng hồ. Tọa độ tính theo ô, trục y hướng xuống.

## Giới hạn
- Bố cục level được chép bằng mắt từ video, nên một số chi tiết (hướng lỗ, vị trí ổ trên phích, số phích ở L11/L12) có thể khác bản gốc. Solver xác nhận cả 14 level (trừ sandbox) đều giải được theo luật trên.
- Luật "chỉ đè lên phích mẹ" và "phích con rơi khi rút phích mẹ" là suy luận từ video, không lấy từ code gốc.
