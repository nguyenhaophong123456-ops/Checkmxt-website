const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Lưu trữ quyền của các tài khoản trên server (Key: UID/Tên tài khoản, Value: loại gói)
// Ví dụ: { "user123": "PRO", "admin_vip": "BOTH" }
let userPermissions = {};

// API kiểm tra quyền của tài khoản khi người dùng nhập vào
app.post('/api/check-permission', (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
        return res.json({ success: false, message: "Vui lòng nhập UID hoặc Token!" });
    }

    const pkg = userPermissions[identifier] || 'FREE';
    let hasPro = (pkg === 'PRO' || pkg === 'BOTH');
    let hasPlus = (pkg === 'PLUS' || pkg === 'BOTH');

    res.json({
        success: true,
        package: pkg,
        hasPro: hasPro,
        hasPlus: hasPlus,
        message: `Đã tải trạng thái quyền: ${pkg}`
    });
});

// API Admin dùng để cấp quyền cho tài khoản
app.post('/api/admin/set-permission', (req, res) => {
    const { adminPass, targetUser, packageType } = req.body;

    // Kiểm tra mật khẩu Admin
    if (adminPass !== "Maiyeuvu12345") {
        return.json({ success: false, message: "❌ Mật khẩu Admin không đúng!" });
    }

    if (!targetUser) {
        return.json({ success: false, message: "Vui lòng nhập UID hoặc tên tài khoản cần cấp!" });
    }

    if (packageType === 'RESET') {
        delete userPermissions[targetUser];
        return res.json({ success: true, message: `🔒 Đã thu hồi toàn bộ quyền của tài khoản ${targetUser} (Về FREE)` });
    }

    // Lưu quyền mới vào server
    userPermissions[targetUser] = packageType;
    res.json({ success: true, message: `⚡ Đã cấp gói ${packageType} cho tài khoản: ${targetUser}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
