const express = require('express');
const app = express();

app.use(express.json());

// Lưu trữ quyền của các tài khoản
let userPermissions = {};

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

    <!-- KHU VỰC QUẢN TRỊ ADMIN -->
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
            <option value="RESET">Hạ về FREE (Thu hồi toàn bộ)</option>
        </select>
        <button class="btn-check" onclick="capQuyenTaiKhoan()">Xác Nhận Cấp Quyền</button>

        <div style="font-size: 11px; color: #8b949e; text-align: center; margin-top: 10px;">Trạng thái hiện tại: <span id="currentStatusBadge" style="color: #238636; font-weight: bold;">FREE</span></div>
    </div>

    <div class="desc" id="mainDesc">Nền tảng công cụ hỗ trợ tài khoản hàng đầu Việt Nam. Bảo mật và tốc độ cao.</div>

    <div style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 15px; margin-bottom: 20px; text-align: left;">
        <div style="font-size: 14px; font-weight: bold; color: #a259ff; margin-bottom: 8px;">🔍 Tra Cứu Thông Tin Acc</div>
        <input type="text" id="tokenInput" class="input-box" placeholder="Nhập UID hoặc Token (EAT/JWT)...">
        <button class="btn-check" onclick="checkToken()">Check Ngay</button>
    </div>

    <!-- DANH SÁCH CHỨC NĂNG -->
    <div class="section-title">Phổ Biến <span>2</span></div>
    <div class="card pro-feature locked" onclick="dungChucNang('Ban 7 Ngày', 'PRO')"><div class="card-info"><div class="card-title">Ban 7 Ngày <span class="badge-pro">PRO</span></div><div class="card-desc">Ban tài khoản đó trong vòng 7 ngày</div></div><div class="arrow">›</div></div>
    <div class="card pro-feature locked" onclick="dungChucNang('Tiểu Sử Dài', 'PRO')"><div class="card-info"><div class="card-title">Tiểu Sử Dài <span class="badge-pro">PRO</span></div><div class="card-desc">Đặt tiểu sử dài cho tài khoản cấp tốc</div></div><div class="arrow">›</div></div>

    <div class="section-title">Quản Lý Token <span>4</span></div>
    <div class="card pro-feature locked" onclick="dungChucNang('Vô Hiệu Hoá Access Token', 'PRO')"><div class="card-info"><div class="card-title">Vô Hiệu Hoá Access Token <span class="badge-pro">PRO</span></div><div class="card-desc">Vô hiệu hoá access token hiện tại ngay lập tức</div></div><div class="arrow">›</div></div>
    <div class="card pro-feature locked" onclick="dungChucNang('EAT → Access Token', 'PRO')"><div class="card-info"><div class="card-title">EAT → Access Token <span class="badge-pro">PRO</span></div><div class="card-desc">Chuyển đổi EAT token sang Access Token</div></div><div class="arrow">›</div></div>
    <div class="card pro-feature locked" onclick="dungChucNang('EAT → JWT Token', 'PRO')"><div class="card-info"><div class="card-title">EAT → JWT Token <span class="badge-pro">PRO</span></div><div class="card-desc">Chuyển đổi EAT Token sang JWT Token</div></div><div class="arrow">›</div></div>
    <div class="card" onclick="dungChucNang('Access Token → JWT Token', 'FREE')"><div class="card-info"><div class="card-title">Access Token → JWT Token <span class="badge-free">FREE</span></div><div class="card-desc">Chuyển đổi Access Token sang JWT Token</div></div><div class="arrow">›</div></div>

    <div class="section-title">Quản Lý Email <span>4</span></div>
    <div class="card pro-feature locked" onclick="dungChucNang('Thêm Email Khôi Phục', 'PRO_EMAIL')"><div class="card-info"><div class="card-title">Thêm Email Khôi Phục <span class="badge-pro">PRO</span></div><div class="card-desc">Thêm email khôi phục (Quy trình 3 bước tự động)</div></div><div class="arrow">›</div></div>
    <div class="card pro-feature locked" onclick="dungChucNang('Huỷ Yêu Cầu Gắn Email', 'PRO')"><div class="card-info"><div class="card-title">Huỷ Yêu Cầu Gắn Email <span class="badge-pro">PRO</span></div><div class="card-desc">Huỷ yêu cầu gắn email khôi phục đang chờ</div></div><div class="arrow">›</div></div>
    <div class="card" onclick="dungChucNang('Huỷ Liên Kết Email', 'FREE')"><div class="card-info"><div class="card-title">Huỷ Liên Kết Email <span class="badge-free">FREE</span></div><div class="card-desc">Gỡ email liên kết khỏi tài khoản</div></div><div class="arrow">›</div></div>
    <div class="card" onclick="dungChucNang('Đổi Email Liên Kết', 'FREE')"><div class="card-info"><div class="card-title">Đổi Email Liên Kết <span class="badge-free">FREE</span></div><div class="card-desc">Thay đổi email liên kết của bạn</div></div><div class="arrow">›</div></div>

    <div class="section-title">Bảo Mật Garena <span>2</span></div>
    <div class="card pro-feature locked" onclick="dungChucNang('Dò Mã Bảo Mật', 'BRUTE')"><div class="card-info"><div class="card-title">Dò Mã Bảo Mật <span class="badge-pro">PRO</span></div><div class="card-desc">Dò mã bảo mật mail xác thực từ 000000 đến 999999</div></div><div class="arrow">›</div></div>
    <div class="card pro-feature locked" onclick="dungChucNang('Ban Vĩnh Viễn', 'PRO')"><div class="card-info"><div class="card-title">Ban Vĩnh Viễn <span class="badge-pro">PRO</span></div><div class="card-desc">Sử dụng login BotTCP để ban vĩnh viễn</div></div><div class="arrow">›</div></div>

    <div class="section-title">Tính Năng Plus & Pro <span>3</span></div>
    <div class="card pro-feature locked" onclick="dungChucNang('Spam Log', 'PRO')"><div class="card-info"><div class="card-title">Spam Log <span class="badge-pro">PRO</span></div><div class="card-desc">Chạy ngầm Spam Log trong game</div></div><div class="arrow">›</div></div>
    <div class="card plus-feature locked" onclick="dungChucNang('Chặn Mail Xác Thực (OTP)', 'PLUS')"><div class="card-info"><div class="card-title">Chặn Mail Xác Thực (OTP) <span class="badge-plus">PLUS</span></div><div class="card-desc">Nhập gmail muốn chặn khiến người khác không nhận được mã</div></div><div class="arrow">›</div></div>
    <div class="card plus-feature locked" onclick="dungChucNang('Đăng Xuất Mọi Thiết Bị', 'PLUS')"><div class="card-info"><div class="card-title">Đăng Xuất Mọi Thiết Bị <span class="badge-plus">PLUS</span></div><div class="card-desc">Đăng xuất toàn bộ thiết bị đang đăng nhập</div></div><div class="arrow">›</div></div>

    <!-- Modal Dò Mã -->
    <div id="bruteModal" class="custom-modal">
        <div class="modal-box">
            <div style="font-size: 15px; font-weight: bold; color: #a259ff; margin-bottom: 5px;">Đang dò mã bảo mật mail xác thực</div>
            <div style="font-size: 11px; color: #8b949e;">Hệ thống đang quét từ 000000 đến 999999...</div>
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
                hienToast("Vui lòng nhập nội dung thông báo mới!");
            }
        }

        async function checkToken() {
            let val = document.getElementById('tokenInput').value.trim();
            if(val === "") {
                hienToast("Vui lòng nhập UID hoặc Token trước khi check!");
                return;
            }

            currentLoggedUser = val;
            hienToast("Đang kết nối hệ thống kiểm tra quyền...");

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

                    let proElements = document.querySelectorAll('.pro-feature');
                    let plusElements = document.querySelectorAll('.plus-feature');

                    proElements.forEach(el => {
                        if (hasPro) el.classList.remove('locked');
                        else el.classList.add('locked');
                    });

                    plusElements.forEach(el => {
                        if (hasPlus) el.classList.remove('locked');
                        else el.classList.add('locked');
                    });

                    let currentText = data.package;
                    document.getElementById('currentStatusBadge').innerText = currentText;
                    hienToast("✅ " + data.message + " (" + data.info + ")");
                } else {
                    hienToast("❌ " + data.message);
                }
            } catch (error) {
                hienToast("❌ Lỗi kết nối đến server!");
            }
        }

        function dungChucNang(tenChucNang, loaiYeuCau) {
            if (!currentLoggedUser) {
                hienToast("⚠️ Vui lòng nhập UID/Token ở ô bên trên và bấm 'Check Ngay' trước!");
                return;
            }

            if (loaiYeuCau === 'PRO' || loaiYeuCau === 'PRO_EMAIL' || loaiYeuCau === 'BRUTE') {
                if (!hasPro) { hienToast("⚠️ Tính năng này yêu cầu quyền Gói PRO!"); return; }
            }
            if (loaiYeuCau === 'PLUS') {
                if (!hasPlus) { hienToast("⚠️ Tính năng này yêu cầu quyền Gói PLUS!"); return; }
            }

            if (loaiYeuCau === 'BRUTE') {
                chayDoMaBaoMat();
                return;
            }
            if (loaiYeuCau === 'PRO_EMAIL') {
                xuLyThemEmail3Buoc();
                return;
            }
            if (tenChucNang === 'Chặn Mail Xác Thực (OTP)') {
                xuLyChanOtp();
                return;
            }
            if (tenChucNang === 'Ban 7 Ngày') {
                let reason = prompt("Nhập lý do ban 7 ngày:", "Vi phạm quy tắc trò chơi");
                if (!reason) return;
                hienToast("Đang thực thi lệnh Ban 7 Ngày...");
                setTimeout(() => hienToast("✅ Đã ban tài khoản thành công trong 7 ngày!"), 2000);
                return;
            }
            if (tenChucNang === 'Tiểu Sử Dài') {
                let bio = prompt("Nhập nội dung tiểu sử muốn thay đổi:", "HIHI MXT Pro Tools");
                if (!bio) return;
                hienToast("Đang cập nhật tiểu sử dài...");
                setTimeout(() => hienToast("✅ Đã đổi tiểu sử thành công!"), 2000);
                return;
            }
            if (tenChucNang === 'Ban Vĩnh Viễn') {
                let confirmBan = confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn BAN VĨNH VIỄN tài khoản này qua BotTCP không?");
                if (!confirmBan) return;
                hienToast("Đang gửi lệnh Ban Vĩnh Viễn...");
                setTimeout(() => hienToast("🚫 Đã thực hiện Ban Vĩnh Viễn thành công!"), 2000);
                return;
            }
            if (tenChucNang === 'Vô Hiệu Hoá Access Token') {
                hienToast("Đang vô hiệu hóa Access Token hiện tại...");
                setTimeout(() => hienToast("✅ Đã vô hiệu hóa token thành công!"), 2000);
                return;
            }
            if (tenChucNang === 'EAT → Access Token' || tenChucNang === 'EAT → JWT Token' || tenChucNang === 'Access Token → JWT Token') {
                hienToast("Đang chuyển đổi định dạng token...");
                setTimeout(() => hienToast("🎉 Chuyển đổi thành công token mới!"), 2000);
                return;
            }
            if (tenChucNang === 'Huỷ Yêu Cầu Gắn Email') {
                hienToast("Đang hủy yêu cầu gắn email đang chờ...");
                setTimeout(() => hienToast("✅ Đã hủy yêu cầu gắn email thành công!"), 2000);
                return;
            }
            if (tenChucNang === 'Huỷ Liên Kết Email' || tenChucNang === 'Đổi Email Liên Kết') {
                let mail = prompt("Nhập email mới hoặc xác nhận thao tác:");
                if (!mail) return;
                hienToast("Đang xử lý liên kết email...");
                setTimeout(() => hienToast("✅ Thao tác email thành công!"), 2000);
                return;
            }
            if (tenChucNang === 'Spam Log') {
                hienToast("Đang chạy ngầm Spam Log trong game...");
                setTimeout(() => hienToast("✅ Đã kích hoạt tiến trình Spam Log!"), 2000);
                return;
            }
            if (tenChucNang === 'Đăng Xuất Mọi Thiết Bị') {
                let cf = confirm("Bạn có muốn đăng xuất toàn bộ thiết bị đang đăng nhập không?");
                if (!cf) return;
                hienToast("Đang gửi lệnh đăng xuất mọi thiết bị...");
                setTimeout(() => hienToast("✅ Đã đăng xuất toàn bộ thiết bị thành công!"), 2000);
                return;
            }

            hienToast("Đang xử lý " + tenChucNang + "...");
            setTimeout(() => hienToast("✅ Thực thi thành công [" + tenChucNang + "]!"), 2000);
        }

        function xuLyThemEmail3Buoc() {
            let emailMoi = prompt("[Bước 1/3] Nhập địa chỉ Gmail muốn gắn vào tài khoản:");
            if (!emailMoi) return;

            hienToast("Đang gửi yêu cầu khởi tạo...");
            setTimeout(() => {
     
