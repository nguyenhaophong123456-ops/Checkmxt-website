const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/check-uid', (req, res) => {
    const { uid } = req.body;
    if (!uid) {
        return res.json({ success: false, message: 'Vui lòng nhập UID!' });
    }
    res.json({ success: true, message: `Đang tra cứu thông tin cho UID: ${uid} thành công!` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server dang chay tren cong ${PORT}`);
});
