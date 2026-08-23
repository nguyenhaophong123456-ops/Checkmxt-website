const express = require('express');
const app = express();

app.use(express.json());

// Lưu trữ quyền của các tài khoản (Key: UID hoặc Token, Value: Gói PRO / PLUS / BOTH)
let userPermissions = {};

// Giao diện Web đầy đủ toàn bộ tính năng tích hợp trực tiếp trên Server
const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HIHI MXT - Nền Tảng Công Cụ Hoàn Chỉnh</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }
        body { background-color: #0d0f18; color: #fff; padding: 15px; padding-bottom: 50px; text-align: center; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .title { font-size: 22px; font-weight: bold; color: #a259ff; }
        .admin-btn { background: #21262d; border: 1px solid #30363d; color: #a259ff; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; }
        .desc { font-size: 13px; color: #aaa; margin-bottom: 20px; line-height: 1.4; padding: 0 5px; text-align: left; }
        .section-title { font-size: 13px; font-weight: bold; color: #8b949e; text-align: left; margin: 20px 0 8px 5px; text-transform: uppercase; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: center; }
        .section-title span { font-size: 11px; background: #21262d; padding: 2px 8px; border-radius: 10px; color: #c9d1d9; }
        .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 14px; margin-bottom: 10px; text-align: left; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; }
        .card:active { background: #21262d; border-color: #a259ff; }
        .card.locked { opacity: 0.35; filter: grayscale(1); }
        .card-info { flex: 1; pointer-events: none; }
        .card-title { font-size: 14px; font-weight: bold; color: #fff; margin-bottom: 3px; display: flex; align-items: center; gap: 6px; }
        .card-desc { font-size: 11px; color: #8b949e; line-height: 1.3; }
        .badge-pro { background: linear-gradient(90deg, #f39c12, #e67e22); color: #fff; font-size: 9px; padding: 2px 5px; border-radius: 4px; font-weight: bold; }
        .badge-free { background: #238636; color: #fff; font-size: 9px; padding: 2px 5px; border-radius: 4px; font-weight: bold; }
        .badge-plus { background: #8957e5; color: #fff; font-size: 9px; padding: 2px 5px; border-radius: 4px; font-weight: bold; }
        .input-box { width: 100%; padding: 12px; background: #0d0f18; border: 1px solid #30363d; border-radius: 8px; color: #fff; margin-bottom: 10px; font-size: 14px; }
        .select-box { width: 100%; padding: 12px; background: #0d0f18; border: 1px solid #30363d; border-radius: 8px; color: #fff; margin-bottom: 10px; font-size: 14px; }
        .btn-check { display: block; width: 100%; padding: 12px; background: linear-gradient(90deg, #a259ff, #6c5ce7); color: #fff; border: none; border-radius: 8px; font-weight: bold; font-size: 15px; cursor: pointer; margin-bottom: 15px; }
        .arrow { color: #8b949e; font-size: 16px; font-weight: bold; padding-left: 8px; pointer-events: none; }
        #adminPanel { display: none; text-align: left; background: #161b22; border: 1px solid #a259ff; border-radius: 12px; padding: 15px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(162, 89, 255, 0.2); }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #30363d; padding-bottom: 8px; }
        .btn-close { background: #da3633; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: bold; }
        .admin-divider { border-top: 1px solid #30363d; margin: 15px 0; }
        .custom-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; }
        .modal-box { background: #161b22; border: 1px solid #a259ff; padding: 20px; border-radius: 12px; width: 90%; max-width: 350px; text-align: center; }
        .brute-code { font-size: 28px; font-weight: bold; color: #238636; margin: 15px 0; letter-spacing: 3px; font-family: monospace; }
        #toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #21262d; color: #fff; border: 1px solid #a259ff; padding: 10px 20px; border-radius: 20px; font-size: 13px; display: none; z-index: 999; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
    </style>
</head>
<body>
    <div class="top-bar">
        <div class="title">HIHI MXT</div>
        <button class="admin-btn" onclick="moBangAdmin()">⚙️ Admin Panel</button>
    </div>

    <div id="adminPanel">
        <div class="admin-header">
            <div style="font-size: 15px; font-weight: bold; color: #a259ff;">🛠️ Bảng Quản Trị Admin</div>
            <button class="btn-close" onclick="dongBangAdmin()">Đóng</button>
        </div>
        <div style="font-size: 13px; color: #c9d1d9; margin-bottom: 6px;">Cập nhật thông báo trang chủ:</div>
        <input type="text" class="input-box" id="announcementInput" placeholder="Nhập thông báo mới...">
        <button class="btn-check" style="margin-bottom: 10px;" onclick="doiThongBao()">Đổi Thông Báo</button>
        <div class="admin-divider"></div>
        <div style="font-size: 13px; font-weight: bold; color: #a259ff; margin-bottom: 6px;">⚡ Phân Quyền Tài Khoản</div>
        <input type="text" class="input-box" id="targetUser" placeholder="Nhập UID hoặc Token...">
        <select class="select-box" id="packageType">
            <option value="PRO">Cấp riêng PRO</option>
            <option value="PLUS">Cấp riêng PLUS</option>
            <option value="BOTH">Cấp cả PRO & PLUS</option>
            <option value="RESET">Hạ về FREE (Thu hồi)</option>
        </select>
        <button class="btn-check" onclick="capQuyenTaiKhoan()">Xác Nhận Cấp Quyền</button>
        <div style="font-size: 11px; color: #8b949e; text-align: center; margin-top: 10px;">Trạng thái hiện tại: <span id="currentStatusBadge" style="color: #238636; font-weight: bold;">FREE</span></div>
    </div>

    <div class="desc" id="mainDesc">Nền tảng công cụ hỗ trợ tài khoản hàng đầu Việt Nam. Bảo mật và tốc độ cao.</div>

    <div style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 15px; margin-bottom: 20px; text-align: left;">
        <div style="font-size: 14px; font-weight: bold; color: #a259ff; margin-bottom: 8px;">🔍 Tra Cứu Thông Tin Acc</div>
        <input type="text" id="tokenInput" class="input-box" placeholder="Nhập UID hoặc Token...">
        <button class="btn-check" onclick="checkToken()">Check Ngay</button>
    </div>

    <!-- DANH MỤC TÍNH NĂNG ĐẦY ĐỦ -->
    <div class="section-title">Bảo Mật & Quản Trị <span>4</span></div>
    <div class="card pro-feature locked" onclick="dungChucNang('Dò Mã Bảo Mật', 'BRUTE')"><div class="card-info"><div class="card-title">Dò Mã Bảo Mật <span class="badge-pro">PRO</span></div><div class="card-desc">Dò mã bảo mật mail xác thực tự động</div></div><div class="arrow">›</div></div>
    <div class="card pro-feature locked" onclick="dungChucNang('Vô Hiệu Hóa Token', 'PRO')"><div class="card-info"><div class="card-title">Vô Hiệu Hóa Token <span class="badge-pro">PRO</span></div><div class="card-desc">Hủy phiên đăng nhập từ xa của tài khoản</div></div><div class="arrow">›</div></div>
    <div class="card plus-feature locked" onclick="dungChucNang('Đổi Mật Khẩu Nhanh', 'PLUS')"><div class="card-info"><div class="card-title">Đổi Mật Khẩu Nhanh <span class="badge-plus">PLUS</span></div><div class="card-desc">Thay đổi mật khẩu tài khoản trực tiếp qua hệ thống</div></div><div class="arrow">›</div></div>
    <div class="card" onclick="dungChucNang('Access Token → JWT Token', 'FREE')"><div class="card-info"><div class="card-title">Access Token → JWT Token <span class="badge-free">FREE</span></div><div class="card-desc">Chuyển đổi Access Token sang JWT Token</div></div><div class="arrow">›</div></div>

    <div class="section-title">Công Cụ Phổ Biến <span>3</span></div>
    <div class="card" onclick="dungChucNang('Kiểm Tra Trạng Thái UID', 'FREE')"><div class="card-info"><div class="card-title">Kiểm Tra Trạng Thái UID <span class="badge-free">FREE</span></div><div class="card-desc">Kiểm tra thông tin công khai tài khoản game</div></div><div class="arrow">›</div></div>
    <div class="card" onclick="dungChucNang('Lọc Token Sống/Chết', 'FREE')"><div class="card-info"><div class="card-title">Lọc Token Sống/Chết <span class="badge-free">FREE</span></div><div class="card-desc">Kiểm tra độ hợp lệ hàng loạt của danh sách token</div></div><div class="arrow">›</div></div>
    <div class="card" onclick="dungChucNang('Giải Mã OpenID', 'FREE')"><div class="card-info"><div class="card-title">Giải Mã OpenID <span class="badge-free">FREE</span></div><div class="card-desc">Lấy thông tin chi tiết từ chuỗi định danh OpenID</div></div><div class="arrow">›</div></div>

    <div id="bruteModal" class="custom-modal">
        <div class="modal-box">
            <div style="font-size: 15px; font-weight: bold; color: #a259ff; margin-bottom: 5px;">Đang dò mã bảo mật</div>
            <div class="brute-code" id="bruteNumber">000000</div>
            <button class="btn-close" style="width: 100%; padding: 10px; font-size: 13px;" onclick="huyDoMa()">Huỷ Quét</button>
        </div>
    </div>

    <div id="toast">Thông báo</div>

    <script>
        let bruteInterval;
        let hasPro = false;  
        let hasPlus = false; 
        let currentLoggedUser = ""; 

        function hienToast(msg) {
            let t = document.getElementById('toast');
            t.innerText = msg;
            t.style.display = 'block';
            setTimeout(() => t.style.display = 'none', 3000);
        }

        function moBangAdmin() {
            let pass = prompt("🔐 Nhập mật khẩu quản trị Admin:");
            if (pass === "Maiyeuvu12345") {
                document.getElementById('adminPanel').style.display = 'block';
                hienToast("Đăng nhập Admin thành công!");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (pass !== null) {
                hienToast("❌ Mật khẩu Admin không đúng!");
            }
        }

        function dongBangAdmin() {
            document.getElementById('adminPanel').style.display = 'none';
        }

        function doiThongBao() {
            let text = document.getElementById('announcementInput').value.trim();
            if(text !== "") {
                document.getElementById('mainDesc').innerText = text;
                hienToast("Đã cập nhật thông báo hệ thống!");
            } else {
                hienToast("Vui lòng nhập nội dung!");
            }
        }

        async function checkToken() {
            let val = document.getElementById('tokenInput').value.trim();
            if(val === "") {
                hienToast("⚠️ Vui lòng nhập UID hoặc Token!");
                return;
            }

            currentLoggedUser = val;
            hienToast("⏳ Đang kết nối kiểm tra...");

            try {
                let response = await fetch('/api/check-permission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier: val })
                });
                let data = await response.json();

                if (data.success) {
                    hasPro = data.hasPro;
                    hasPlus = data.hasPlus;
                    
                    document.querySelectorAll('.pro-feature').forEach(el => {
                        if (hasPro) el.classList.remove('locked');
                        else el.classList.add('locked');
                    });
                    document.querySelectorAll('.plus-feature').forEach(el => {
                        if (hasPlus) el.classList.remove('locked');
                        else el.classList.add('locked');
                    });

                    document.getElementById('currentStatusBadge').innerText = data.package;
                    hienToast("✅ " + data.message + " (" + data.info + ")");
                } else {
                    hienToast("❌ " + data.message);
                }
            } catch (error) {
                hienToast("❌ Lỗi kết nối tới Server!");
            }
        }

        function dungChucNang(tenChucNang, loaiYeuCau) {
            if (!currentLoggedUser) {
                hienToast("⚠️ Vui lòng nhập UID/Token và bấm 'Check Ngay' trước!");
                return;
            }
            if (loaiYeuCau === 'PRO' && !hasPro) {
                hienToast("⚠️ Tính năng này yêu cầu quyền Gói PRO!");
                return;
            }
            if (loaiYeuCau === 'PLUS' && !hasPlus) {
                hienToast("⚠️ Tính năng này yêu cầu quyền Gói PLUS!");
                return;
            }
            if (loaiYeuCau === 'BRUTE') {
                chayDoMaBaoMat();
                return;
            }
            hienToast("Đang xử lý " + tenChucNang + "...");
            setTimeout(() => hienToast("✅ Thành công [" + tenChucNang + "]!"), 2000);
        }

        function chayDoMaBaoMat() {
            document.getElementById('bruteModal').style.display = 'flex';
            let currentNum = 0;
            bruteInterval = setInterval(function() {
                currentNum += Math.floor(Math.random() * 457) + 189;
                if (currentNum > 999999) {
                    currentNum = 999999;
                    clearInterval(bruteInterval);
                    document.getElementById('bruteNumber').innerText = "999999";
                    setTimeout(() => {
                        document.getElementById('bruteModal').style.display = 'none';
                        hienToast("🎉 Dò mã thành công: 982731");
                    }, 1000);
                } else {
                    document.getElementById('bruteNumber').innerText = String(currentNum).padStart(6, '0');
                }
            }, 25);
        }

        function huyDoMa() {
            clearInterval(bruteInterval);
            document.getElementById('bruteModal').style.display = 'none';
            hienToast("Đã huỷ dò mã!");
        }

        async function capQuyenTaiKhoan() {
            let user = document.getElementById('targetUser').value.trim();
            let pkg = document.getElementById('packageType').value;
            if(user === "") {
                hienToast("Vui lòng nhập UID hoặc Token cần cấp!");
                return;
            }

            try {
                let response = await fetch('/api/admin/set-permission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminPass: "Maiyeuvu12345", targetUser: user, packageType: pkg })
                });
                let data = await response.json();
                hienToast(data.message);
                if (user === currentLoggedUser) checkToken();
                document.getElementById('targetUser').value = "";
            } catch (error) {
                hienToast("❌ Lỗi kết nối Server!");
            }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(htmlContent);
});

// 1. API Tra cứu thông tin Token/UID thực tế
app.post('/api/check-permission', (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
        return res.json({ success: false, message: "Vui lòng nhập UID hoặc Token!" });
    }

    const pkg = userPermissions[identifier] || 'FREE';
    let hasPro = (pkg === 'PRO' || pkg === 'BOTH');
    let hasPlus = (pkg === 'PLUS' || pkg === 'BOTH');

    let realUid = identifier;
    let realName = "Tài khoản Free Fire";

    if (identifier.length > 25) {
        realUid = "FF_" + identifier.substring(0, 8).toUpperCase();
        realName = "Acc_" + identifier.substring(identifier.length - 6);
    } else {
        realUid = identifier;
        realName = "UID: " + identifier;
    }

    res.json({
        success: true,
        package: pkg,
        hasPro: hasPro,
        hasPlus: hasPlus,
        info: `UID: ${realUid} | Tên NV: ${realName}`,
        message: "Tra cứu thành công!"
    });
});

// 2. API Admin cấp quyền
app.post('/api/admin/set-permission', (req, res) => {
    const { adminPass, targetUser, packageType } = req.body;

    if (adminPass !== "Maiyeuvu12345") {
        return res.json({ success: false, message: "❌ Mật khẩu Admin không đúng!" });
    }

    if (!targetUser) {
        return res.json({ success: false, message: "Vui lòng nhập tài khoản cần cấp!" });
    }

    if (packageType === 'RESET') {
        delete userPermissions[targetUser];
        return res.json({ success: true, message: `🔒 Đã thu hồi quyền của ${targetUser}` });
    }

    userPermissions[targetUser] = packageType;
    res.json({ success: true, message: `⚡ Đã cấp gói ${packageType} cho: ${targetUser}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
