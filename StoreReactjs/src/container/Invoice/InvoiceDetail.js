import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getInvoiceDetailService } from '../../services/userService';
import { toast } from 'react-toastify';
import CommonUtils from '../../utils/CommonUtils';
import './Invoice.scss';

function InvoiceDetail() {
    const { invoiceId } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInvoiceDetail();
    }, [invoiceId]);

    const fetchInvoiceDetail = async () => {
        try {
            setIsLoading(true);
            const res = await getInvoiceDetailService(invoiceId);

            if (res && res.errCode === 0) {
                setInvoice(res.data);
            } else {
                toast.error(res.errMessage || 'Lỗi khi lấy chi tiết hóa đơn');
            }
        } catch (error) {
            console.error('Error fetching invoice detail:', error);
            toast.error('Lỗi khi tải chi tiết hóa đơn');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (!invoice) {
        return <div className="no-data">Không tìm thấy hóa đơn</div>;
    }

    return (
        <div className="invoice-detail-container">
            <div className="invoice-header">
                <h2>Chi tiết Hóa đơn #{invoice.id}</h2>
                <button className="btn btn-secondary" onClick={() => window.history.back()}>
                    ← Quay lại
                </button>
            </div>

            <div className="invoice-content">
                {/* Thông tin hóa đơn */}
                <div className="invoice-info">
                    <div className="row">
                        <div className="col-md-6">
                            <h4>Thông tin hóa đơn</h4>
                            <p><strong>Mã HĐ:</strong> #{invoice.id}</p>
                            <p><strong>Ngày tạo:</strong> {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Trạng thái:</strong> {invoice.statusOrderData?.value || 'Đã giao'}</p>
                        </div>
                        <div className="col-md-6">
                            <h4>Thông tin khách hàng</h4>
                            <p><strong>Tên:</strong> {invoice.userData?.lastName || 'N/A'}</p>
                            <p><strong>Email:</strong> {invoice.userData?.email || 'N/A'}</p>
                            <p><strong>Điện thoại:</strong> {invoice.userData?.phonenumber || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Thông tin giao hàng */}
                <div className="shipping-info">
                    <h4>Thông tin giao hàng</h4>
                    <div className="row">
                        <div className="col-md-6">
                            <p><strong>Tên người nhận:</strong> {invoice.addressUser?.shipName || 'N/A'}</p>
                            <p><strong>Địa chỉ giao:</strong> {invoice.addressUser?.shipAdress || 'N/A'}</p>
                            <p><strong>Email:</strong> {invoice.addressUser?.shipEmail || 'N/A'}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Điện thoại:</strong> {invoice.addressUser?.shipPhonenumber || 'N/A'}</p>
                            <p><strong>Loại vận chuyển:</strong> {invoice.typeShipData?.name || 'N/A'}</p>
                            <p><strong>Ghi chú:</strong> {invoice.note || 'Không có'}</p>
                        </div>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="order-items">
                    <h4>Danh sách sản phẩm</h4>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Loại/Size</th>
                                <th>Số lượng</th>
                                <th>Giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.orderDetails && invoice.orderDetails.length > 0 ? (
                                invoice.orderDetails.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.productDetail?.productDetailData?.name || item.productDetail?.nameDetail || 'N/A'}</td>
                                        <td>{item.productDetailSize?.sizeData?.value || 'N/A'}</td>
                                        <td>{item.quantity}</td>
                                        <td>{CommonUtils.formatter.format(item.realPrice || 0)} ₫</td>
                                        <td className="total">
                                            {CommonUtils.formatter.format((item.realPrice || 0) * (item.quantity || 0))} ₫
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">Không có sản phẩm</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Tóm tắt chi phí */}
                <div className="cost-summary">
                    <div className="summary-row">
                        <span>Tổng tiền hàng:</span>
                        <span>{CommonUtils.formatter.format(invoice.subtotal || 0)} ₫</span>
                    </div>
                    {invoice.discount > 0 && (
                        <div className="summary-row">
                            <span>Giảm giá:</span>
                            <span>-{CommonUtils.formatter.format(invoice.discount || 0)} ₫</span>
                        </div>
                    )}
                    <div className="summary-row">
                        <span>Phí vận chuyển:</span>
                        <span>{CommonUtils.formatter.format(invoice.shippingFee || 0)} ₫</span>
                    </div>
                    <div className="summary-row total">
                        <span>Tổng cộng:</span>
                        <span>{CommonUtils.formatter.format(invoice.totalPrice || 0)} ₫</span>
                    </div>
                </div>

                {/* Nút in hóa đơn */}
                <div className="invoice-actions">
                    <button className="btn btn-primary" onClick={() => window.print()}>
                        🖨️ In hóa đơn
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InvoiceDetail;
