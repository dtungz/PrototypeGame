# Perfect Bento: HTML prototype

Bản chơi thử màn hình dọc, dựng lại 134 level (4 chapter + Daily) của *Perfect Bento: Block Master* từ level data gốc, để nghiên cứu mechanic.

**Chơi:** https://dtungz.github.io/PrototypeGame/perfect-bento/ (máy tính hoặc điện thoại)

## Cách chơi
- **Kéo** miếng cơm vào khay cho kín. Khay cũng kéo được, cơm đã đặt trong khay sẽ đi theo.
- **Kéo dao** lên cơm theo đường lưới rồi bấm **Cắt**. Dao có biểu tượng ↻ thì chạm để xoay.
- Topping trên cơm phải nằm đúng ô topping vẽ trong khay (đặt sai sẽ hiện dấu X).
- Mỗi level có giới hạn số nhát cắt; cắt quá số đó thì mất 1 sao.
- **Daily:** không có dao, chạm vào miếng cơm để xoay rồi lấp kín hộp.
- Có Undo, Hint (ảnh đáp án) và màn chọn level.

## Mechanic theo chapter
| Chapter | Nội dung |
|---|---|
| 1 | Kéo thả, xếp nhiều mảnh, dao ngang/dọc, cắt nhiều nhát, bỏ cơm thừa |
| 2 | Topping khớp ô, 2 dao, topping mồi phải cắt bỏ |
| 3 | Dao xoay được, thớt 8x12 |
| 4 | Topping lớn ghép nhiều ô, khay toàn cơm trắng |
| Daily | Lấp hộp, xoay mảnh |

## Cấu trúc
- `index.html`: toàn bộ code game
- `levels.js`: level data rút gọn + metadata sprite topping
- `assets/`: ảnh và âm thanh

> Asset (hình, âm thanh, level data) thuộc về nhà phát triển game gốc; repo chỉ dùng cho mục đích học tập và review nội bộ.
