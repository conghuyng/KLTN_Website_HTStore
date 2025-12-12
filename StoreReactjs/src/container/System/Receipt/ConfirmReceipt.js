import React, { useEffect, useState } from 'react';
import { getDetailReceiptByIdService, confirmReceiptService } from '../../../services/userService';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import CommonUtils from '../../../utils/CommonUtils';
import moment from 'moment';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

const ConfirmReceipt = (props) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dataReceiptDetail, setdataReceiptDetail] = useState([]);
    const [receiptInfo, setReceiptInfo] = useState({});
    const [imagePreview, setImagePreview] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [image, setImage] = useState('');
    const userData = JSON.parse(localStorage.getItem('userData'));

    useEffect(() => {
        loadReceiptDetail(id);
    }, []);

    let loadReceiptDetail = async (id) => {
        let res = await getDetailReceiptByIdService(id);
        if (res && res.errCode == 0) {
            // Khởi tạo actualQuantity = quantity cho mỗi item
            const detailsWithActual = (res.data.receiptDetail || []).map(item => ({
                ...item,
                actualQuantity: item.actualQuantity || item.quantity
            }));
            setdataReceiptDetail(detailsWithActual);
            setReceiptInfo(res.data);
        }
    }

    let handleOnChangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file);
            let objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
            setImage(base64);
        }
    }

    let handleChangeActualQuantity = (index, value) => {
        const newData = [...dataReceiptDetail];
        newData[index].actualQuantity = parseInt(value) || 0;
        setdataReceiptDetail(newData);
    }

    let openPreviewImage = () => {
        if (!imagePreview) return;
        setIsOpen(true);
    }

    let handleConfirmReceipt = async () => {
        if (!image) {
            toast.error("Vui lòng upload ảnh minh chứng!");
            return;
        }

        if (!userData || !userData.id) {
            toast.error("Không tìm thấy thông tin người dùng!");
            return;
        }

        // Chuẩn bị data để gửi
        const receiptDetails = dataReceiptDetail.map(item => ({
            productDetailSizeId: item.productDetailSizeId,
            quantity: item.quantity,
            actualQuantity: item.actualQuantity
        }));

        let res = await confirmReceiptService({
            id: id,
            confirmedBy: userData.id,
            image: image,
            receiptDetails: receiptDetails
        });

        if (res && res.errCode === 0) {
            toast.success(res.errMessage);
            setTimeout(() => {
                navigate('/admin/list-receipt');
            }, 1500);
        } else {
            toast.error(res.errMessage || "Xác nhận thất bại!");
        }
    }

    let calculateTotal = () => {
        let total = 0;
        dataReceiptDetail.forEach(item => {
            total += item.quantity * item.price;
        });
        return total.toLocaleString();
    }

    let calculateActualTotal = () => {
        let total = 0;
        dataReceiptDetail.forEach(item => {
            total += (item.actualQuantity || item.quantity) * item.price;
        });
        return total.toLocaleString();
    }

    return (
        <div className="container-fluid px-4">
            <h1 className="mt-4">Xác nhận phiếu nhập hàng</h1>

            <div className="card mb-4">
                <div className="card-header">
                    <i className="fas fa-file-alt me-1" />
                    Thông tin phiếu nhập #{id}
                    {receiptInfo.statusId === 'S2' && 
                        <span className="badge bg-success ms-2">Đã xác nhận</span>
                    }
                    {receiptInfo.statusId === 'S1' && 
                        <span className="badge bg-warning ms-2">Chờ xác nhận</span>
                    }
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <p><strong>Ngày tạo:</strong> {moment(receiptInfo.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                            <p><strong>Người tạo:</strong> {receiptInfo.userData?.firstName} {receiptInfo.userData?.lastName}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Nhà cung cấp:</strong> {receiptInfo.supplierData?.name}</p>
                            <p><strong>Trạng thái:</strong> {receiptInfo.statusId === 'S2' ? 'Đã xác nhận' : 'Chờ xác nhận'}</p>
                        </div>
                    </div>

                    <h5>Chi tiết sản phẩm nhập:</h5>
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Sản phẩm</th>
                                    <th>Loại</th>
                                    <th>Size</th>
                                    <th>SL dự kiến</th>
                                    {receiptInfo.statusId === 'S1' && <th>SL thực tế</th>}
                                    {(receiptInfo.statusId === 'S2' || receiptInfo.statusId === 'S3') && <th>SL thực tế</th>}
                                    <th>Giá nhập</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataReceiptDetail && dataReceiptDetail.length > 0 &&
                                    dataReceiptDetail.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.productData?.name}</td>
                                                <td>{item.productDetailData?.nameDetail}</td>
                                                <td>{item.productDetailSizeData?.sizeData?.value}</td>
                                                <td>{item.quantity}</td>
                                                {receiptInfo.statusId === 'S1' && (
                                                    <td>
                                                        <input 
                                                            type="number" 
                                                            className="form-control" 
                                                            style={{width: '80px'}}
                                                            value={item.actualQuantity}
                                                            onChange={(e) => handleChangeActualQuantity(index, e.target.value)}
                                                            min="0"
                                                            max={item.quantity}
                                                        />
                                                    </td>
                                                )}
                                                {(receiptInfo.statusId === 'S2' || receiptInfo.statusId === 'S3') && (
                                                    <td>
                                                        {item.actualQuantity || item.quantity}
                                                        {item.actualQuantity < item.quantity && 
                                                            <span className="text-danger ms-1">
                                                                (-{item.quantity - item.actualQuantity})
                                                            </span>
                                                        }
                                                    </td>
                                                )}
                                                <td>{item.price.toLocaleString()} VNĐ</td>
                                                <td>{((item.actualQuantity || item.quantity) * item.price).toLocaleString()} VNĐ</td>
                                            </tr>
                                        )
                                    })
                                }
                                <tr>
                                    <td colSpan={receiptInfo.statusId === 'S1' ? "7" : "6"} className="text-end">
                                        <strong>Tổng cộng (thực tế):</strong>
                                    </td>
                                    <td><strong>{calculateActualTotal()} VNĐ</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {receiptInfo.statusId === 'S1' && (
                        <div className="mt-4">
                            <h5>Xác nhận nhập hàng (Role R4):</h5>
                            <div className="form-group">
                                <label htmlFor="imageInput">Upload ảnh minh chứng <span className="text-danger">*</span></label>
                                <input
                                    id="imageInput"
                                    type="file"
                                    className="form-control-file"
                                    onChange={(event) => handleOnChangeImage(event)}
                                    accept="image/*"
                                />
                            </div>
                            {imagePreview &&
                                <div className="col-md-12 mt-3">
                                    <div style={{ backgroundImage: `url(${imagePreview})` }}
                                        onClick={() => openPreviewImage()}
                                        className="box-img-preview"></div>
                                </div>
                            }
                            <button
                                onClick={() => handleConfirmReceipt()}
                                className="btn btn-success mt-3"
                            >
                                <i className="fas fa-check me-1"></i>
                                Xác nhận và cập nhật số lượng
                            </button>
                        </div>
                    )}

                    {receiptInfo.statusId === 'S2' && receiptInfo.image && (
                        <div className="mt-4">
                            <h5>Ảnh minh chứng:</h5>
                            <div style={{ 
                                backgroundImage: `url(${receiptInfo.image})`,
                                width: '200px',
                                height: '200px',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                cursor: 'pointer',
                                border: '1px solid #ddd',
                                borderRadius: '5px'
                            }}
                            onClick={() => {
                                setImagePreview(receiptInfo.image);
                                setIsOpen(true);
                            }}></div>
                        </div>
                    )}

                    <div className="mt-3">
                        <button
                            onClick={() => navigate('/admin/receipt')}
                            className="btn btn-secondary"
                        >
                            <i className="fas fa-arrow-left me-1"></i>
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <Lightbox
                    mainSrc={imagePreview}
                    onCloseRequest={() => setIsOpen(false)}
                />
            )}

            <style jsx>{`
                .box-img-preview {
                    width: 200px;
                    height: 200px;
                    background-size: cover;
                    background-position: center;
                    cursor: pointer;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
            `}</style>
        </div>
    )
}

export default ConfirmReceipt;
