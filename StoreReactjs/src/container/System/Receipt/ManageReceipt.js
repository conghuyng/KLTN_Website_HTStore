import React from 'react';
import { useEffect, useState } from 'react';
import { deleteReceiptService, getAllReceipt, cancelReceiptService } from '../../../services/userService';
import moment from 'moment';
import { toast } from 'react-toastify';
import { PAGINATION } from '../../../utils/constant';
import ReactPaginate from 'react-paginate';
import CommonUtils from '../../../utils/CommonUtils';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";

const ManageReceipt = () => {
  
    const [dataReceipt, setdataReceipt] = useState([])
    const [count, setCount] = useState('')
    const [numberPage, setnumberPage] = useState('')
    useEffect(() => {
        try {
           
            fetchData();
        } catch (error) {
            console.log(error)
        }

    }, [])
    let fetchData = async () => {
        let arrData = await getAllReceipt({

           
            limit: PAGINATION.pagerow,
            offset: 0,
           

        })
        if (arrData && arrData.errCode === 0) {
            setdataReceipt(arrData.data)
            setCount(Math.ceil(arrData.count / PAGINATION.pagerow))
        }
    }
    
    let handleChangePage = async (number) => {
        setnumberPage(number.selected)
        let arrData = await getAllReceipt({

          
            limit: PAGINATION.pagerow,
            offset: number.selected * PAGINATION.pagerow,
            

        })
        if (arrData && arrData.errCode === 0) {
            setdataReceipt(arrData.data)

        }
    }
    
    let handleOnClickExport =async () =>{
        let res = await getAllReceipt({
            limit: '',
            offset: '',
           
        })
        if(res && res.errCode == 0){
            await CommonUtils.exportExcel(res.data,"Danh sách nhập hàng","ListReceipt")
        }
       
    }
    
    let handleCancelReceipt = async (receiptId) => {
        if (window.confirm('Bạn có chắc muốn hủy nhập hàng này? Số lượng đã nhập sẽ bị trừ khỏi kho.')) {
            let res = await cancelReceiptService({ id: receiptId });
            if (res && res.errCode === 0) {
                toast.success(res.errMessage);
                fetchData();
            } else {
                toast.error(res.errMessage || 'Hủy nhập hàng thất bại!');
            }
        }
    }
    
    return (
        <div className="container-fluid px-4">
            <h1 className="mt-4">Quản lý phiếu nhập</h1>


            <div className="card mb-4">
                <div className="card-header">
                    <i className="fas fa-table me-1" />
                    Danh sách nhập hàng
                </div>
                <div className="card-body">
               
                    <div className='row'>
                   
                    <div className='col-12'>
                    <button  style={{float:'right'}} onClick={() => handleOnClickExport()} className="btn btn-success mb-2" >Xuất excel <i class="fa-solid fa-file-excel"></i></button>
                    </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-bordered" style={{ border: '1' }} width="100%" cellspacing="0">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Ngày nhập hàng</th>
                                    <th>Tên nhà cung cấp</th>
                                    <th>Số điện thoại</th>
                                    <th>Tên nhân viên</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {dataReceipt && dataReceipt.length > 0 &&
                                    dataReceipt.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{moment.utc(item.createdAt).local().format('DD/MM/YYYY HH:mm:ss')}</td>
                                                <td>{item.supplierData.name}</td>
                                                <td>{item.supplierData.phonenumber}</td>
                                                <td>{item.userData.firstName +" "+item.userData.lastName}</td>
                                                <td>
                                                    {item.statusId === 'S1' && <span className="badge bg-warning text-dark">Chờ xác nhận</span>}
                                                    {item.statusId === 'S2' && <span className="badge bg-success">Xác nhận đủ</span>}
                                                    {item.statusId === 'S3' && <span className="badge bg-danger">Xác nhận thiếu</span>}
                                                    {item.statusId === 'S4' && <span className="badge bg-primary">Hoàn thành</span>}
                                                    {item.statusId === 'S5' && <span className="badge bg-secondary">Đã hủy</span>}
                                                    {!item.statusId && <span className="badge bg-secondary">Chưa xác định</span>}
                                                </td>
                                                <td>
                                                    <Link to={`/admin/detail-receipt/${item.id}`}>Chi tiết</Link>
                                                    &nbsp; &nbsp;
                                                    {item.statusId === 'S1' && (
                                                        <>
                                                            <Link to={`/admin/confirm-receipt/${item.id}`} className="text-success">
                                                                <i className="fas fa-check"></i> Xác nhận
                                                            </Link>
                                                        </>
                                                    )}
                                                    {item.statusId === 'S3' && (
                                                        <>
                                                            &nbsp; &nbsp;
                                                            <a 
                                                                href="#" 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleCancelReceipt(item.id);
                                                                }} 
                                                                className="text-danger"
                                                            >
                                                                <i className="fas fa-times"></i> Hủy nhập hàng
                                                            </a>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })
                                }


                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <ReactPaginate
                previousLabel={'Quay lại'}
                nextLabel={'Tiếp'}
                breakLabel={'...'}
                pageCount={count}
                marginPagesDisplayed={3}
                containerClassName={"pagination justify-content-center"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                breakLinkClassName={"page-link"}
                breakClassName={"page-item"}
                activeClassName={"active"}
                onPageChange={handleChangePage}
            />
        </div>
    )
}
export default ManageReceipt;