import React from "react";
import "./Footer.scss";
import "@fortawesome/fontawesome-free/css/all.min.css"; // ✅ Import Font Awesome 6

function Footer() {
  return (
    <footer className="footer-area section_gap">
      <div className="container">
        <div className="row">
          {/* Thông tin công ty */}
          <div className="col-lg-3 col-md-6 single-footer-widget">
            <div className="footer-brand">
              <h4>HTStore</h4>
              <p>Chuyên cung cấp sản phẩm chất lượng cao với giá cả hợp lý.</p>
              <div className="social-links">
                <a href="#" className="social-link facebook">
                  <i className="fa-brands fa-facebook"></i>
                </a>
                <a href="#" className="social-link twitter">
                  <i className="fa-brands fa-x-twitter"></i>
                </a>
                <a href="#" className="social-link instagram">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="#" className="social-link youtube">
                  <i className="fa-brands fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Sản phẩm */}
          <div className="col-lg-2 col-md-6 single-footer-widget">
            <h4>Sản phẩm</h4>
            <ul>
              <li><a href="/shop">Tất cả sản phẩm</a></li>
              <li><a href="/shop?category=electronics">Điện tử</a></li>
              <li><a href="/shop?category=clothing">Thời trang</a></li>
              <li><a href="/shop?category=home">Gia dụng</a></li>
              <li><a href="/shop?category=beauty">Làm đẹp</a></li>
              <li><a href="/shop?category=sports">Thể thao</a></li>
            </ul>
          </div>

          {/* Hỗ trợ khách hàng */}
          <div className="col-lg-2 col-md-6 single-footer-widget">
            <h4>Hỗ trợ</h4>
            <ul>
              <li><a href="/contact">Liên hệ</a></li>
              <li><a href="/help">Hướng dẫn mua hàng</a></li>
              <li><a href="/shipping">Vận chuyển</a></li>
              <li><a href="/return">Đổi trả</a></li>
              <li><a href="/faq">Câu hỏi thường gặp</a></li>
              <li><a href="/warranty">Bảo hành</a></li>
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div className="col-lg-3 col-md-6 single-footer-widget">
            <h4>Liên hệ</h4>
            <div className="contact-info">
              <div className="contact-item">
                <i className="fa-solid fa-location-dot"></i>
                <span>123 Đường ABC, TP.HCM</span>
              </div>
              <div className="contact-item">
                <i className="fa-solid fa-phone"></i>
                <span>+84 123 456 789</span>
              </div>
              <div className="contact-item">
                <i className="fa-solid fa-envelope"></i>
                <span>info@htstore.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom row align-items-center mt-4 pt-3 border-top">
          <div className="col-lg-6 col-md-12">
            <p className="footer-text m-0">
              © 2025 <b>HTStore</b>. Tất cả quyền được bảo lưu. | 
              <span className="author"> Đồ án tốt nghiệp </span>
            </p>
          </div>
          <div className="col-lg-6 col-md-12 text-right">
            <div className="footer-links">
              <a href="/privacy">Chính sách bảo mật</a>
              <a href="/terms">Điều khoản sử dụng</a>
              <a href="/sitemap">Sitemap</a>
              <a href="https://colorlib.com" target="_blank" rel="noopener noreferrer">
                <i className="fa-regular fa-heart"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
