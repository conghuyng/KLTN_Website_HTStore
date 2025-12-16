import React, { useEffect, useState } from 'react';
import { getAllInvoicesService, searchInvoicesService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CommonUtils from '../../utils/CommonUtils';
import './Invoice.scss';

function InvoiceList() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalInvoices, setTotalInvoices] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [searchType, setSearchType] = useState('all'); // all, name, email, phone, invoiceId, date
    const [searchValue, setSearchValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusId, setStatusId] = useState('S6'); // Mặc định là S6 (Đã giao)
    const itemsPerPage = 10;

    useEffect(() => {
        if (searchType === 'date') {
            if (startDate && endDate) {
                handleSearch();
            }
        } else if (searchValue) {
            handleSearch();
        } else {
            fetchInvoices();
        }
    }, [currentPage, searchType, searchValue, startDate, endDate, statusId]);

    const fetchInvoices = async () => {
        try {
            setIsLoading(true);
            const offset = currentPage * itemsPerPage;
            const res = await getAllInvoicesService({
                limit: itemsPerPage,
                offset: offset,
                statusId: statusId
            });

            if (res && res.errCode === 0) {
                setInvoices(res.data);
                setTotalInvoices(res.count);
            } else {
                toast.error('Lỗi khi lấy danh sách hóa đơn');
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error('Lỗi khi tải danh sách hóa đơn');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            setIsLoading(true);
            const offset = currentPage * itemsPerPage;
            let searchData = {
                limit: itemsPerPage,
                offset: offset,
                statusId: statusId
            };

            if (searchType === 'date') {
                searchData.startDate = startDate;
                searchData.endDate = endDate;
            } else if (searchType !== 'all') {
                searchData.searchType = searchType;
                searchData.searchValue = searchValue;
            } else {
                searchData.searchValue = searchValue;
            }

            const res = await searchInvoicesService(searchData);

            if (res && res.errCode === 0) {
                setInvoices(res.data);
                setTotalInvoices(res.count);
            } else {
                toast.error('Lỗi khi tìm kiếm hóa đơn');
            }
        } catch (error) {
            console.error('Error searching invoices:', error);
            toast.error('Lỗi khi tìm kiếm hóa đơn');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetail = (invoiceId) => {
        navigate(`/admin/invoice-detail/${invoiceId}`);
    };

    const totalPages = Math.ceil(totalInvoices / itemsPerPage);

    return (
        <div className="invoice-container">
            <div className="invoice-header">
                <h2>Quản lý Hóa đơn</h2>
                <p>Danh sách các hóa đơn đã thanh toán thành công</p>
            </div>

            {/* Search Section */}
            <div className="invoice-search">
                <div className="search-filters">
                    <div className="filter-group">
                        <label>Trạng thái:</label>
                        <select 
                            value={statusId} 
                            onChange={(e) => {
                                setStatusId(e.target.value);
                                setCurrentPage(0);
                            }}
                            className="filter-select"
                        >
                            <option value="S6">Đã giao (S6)</option>
                            <option value="S5">Đang vận chuyển (S5)</option>
                            <option value="S4">Chờ vận chuyển (S4)</option>
                            <option value="S3">Chờ xác nhận (S3)</option>
                            <option value="S7">Hủy đơn (S7)</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Loại tìm kiếm:</label>
                        <select 
                            value={searchType} 
                            onChange={(e) => {
                                setSearchType(e.target.value);
                                setSearchValue('');
                                setStartDate('');
                                setEndDate('');
                                setCurrentPage(0);
                            }}
                            className="filter-select"
                        >
                            <option value="all">Tất cả</option>
                            <option value="name">Tên khách hàng</option>
                            <option value="email">Email</option>
                            <option value="phone">Số điện thoại</option>
                            <option value="invoiceId">Mã hóa đơn</option>
                            <option value="date">Theo ngày</option>
                        </select>
                    </div>

                    {searchType !== 'date' && (
                        <div className="filter-group">
                            <label>Từ khóa:</label>
                            <input
                                type="text"
                                placeholder={
                                    searchType === 'name' ? 'Nhập tên khách hàng...' :
                                    searchType === 'email' ? 'Nhập email...' :
                                    searchType === 'phone' ? 'Nhập số điện thoại...' :
                                    searchType === 'invoiceId' ? 'Nhập mã hóa đơn...' :
                                    'Nhập từ khóa...'
                                }
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    setCurrentPage(0);
                                }}
                                className="filter-input"
                            />
                        </div>
                    )}

                    {searchType === 'date' && (
                        <>
                            <div className="filter-group">
                                <label>Từ ngày:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setCurrentPage(0);
                                    }}
                                    className="filter-input"
                                />
                            </div>
                            <div className="filter-group">
                                <label>Đến ngày:</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setCurrentPage(0);
                                    }}
                                    className="filter-input"
                                />
                            </div>
                        </>
                    )}

                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                            setSearchType('all');
                            setSearchValue('');
                            setStartDate('');
                            setEndDate('');
                            setCurrentPage(0);
                        }}
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="loading">Đang tải...</div>
            ) : invoices.length > 0 ? (
                <>
                    <div className="invoice-table">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Mã HĐ</th>
                                    <th>Khách hàng</th>
                                    <th>Email</th>
                                    <th>Số điện thoại</th>
                                    <th>Tổng tiền</th>
                                    <th>Ngày tạo</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice, index) => (
                                    <tr key={index}>
                                        <td className="invoice-id">#{invoice.id}</td>
                                        <td>{invoice.userData?.lastName || 'N/A'}</td>
                                        <td>{invoice.userData?.email || 'N/A'}</td>
                                        <td>{invoice.userData?.phonenumber || 'N/A'}</td>
                                        <td className="total-amount">
                                            {CommonUtils.formatter.format(invoice.totalPrice || 0)} ₫
                                        </td>
                                        <td>
                                            {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-info"
                                                onClick={() => handleViewDetail(invoice.id)}
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <nav className="pagination-container">
                            <ul className="pagination">
                                <li className={currentPage === 0 ? 'disabled' : ''}>
                                    <button
                                        onClick={() => setCurrentPage(0)}
                                        disabled={currentPage === 0}
                                    >
                                        First
                                    </button>
                                </li>
                                <li className={currentPage === 0 ? 'disabled' : ''}>
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 0}
                                    >
                                        Previous
                                    </button>
                                </li>

                                {Array.from({ length: totalPages }, (_, i) => (
                                    <li key={i} className={currentPage === i ? 'active' : ''}>
                                        <button
                                            onClick={() => setCurrentPage(i)}
                                            className={currentPage === i ? 'active' : ''}
                                        >
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}

                                <li className={currentPage === totalPages - 1 ? 'disabled' : ''}>
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages - 1}
                                    >
                                        Next
                                    </button>
                                </li>
                                <li className={currentPage === totalPages - 1 ? 'disabled' : ''}>
                                    <button
                                        onClick={() => setCurrentPage(totalPages - 1)}
                                        disabled={currentPage === totalPages - 1}
                                    >
                                        Last
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </>
            ) : (
                <div className="no-data">
                    <p>Chưa có hóa đơn nào</p>
                </div>
            )}
        </div>
    );
}

export default InvoiceList;
