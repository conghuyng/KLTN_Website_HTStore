import db from "../models/index";
require('dotenv').config();
const { Op } = require("sequelize");
let createNewReceipt = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.userId || !data.supplierId || !data.productDetailSizeId || !data.quantity
                || !data.price
            ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {

                let receipt = await db.Receipt.create({
                    userId: data.userId,
                    supplierId: data.supplierId,
                    statusId: 'S1' // S1 = Chờ xác nhận, S2 = Đã xác nhận
                })
                if (receipt) {
                    await db.ReceiptDetail.create({
                        receiptId: receipt.id,
                        productDetailSizeId: data.productDetailSizeId,
                        quantity: data.quantity,
                        price: data.price,
                    }
                    )
                }
                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}
let createNewReceiptDetail = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.receiptId || !data.productDetailSizeId || !data.quantity
                || !data.price
            ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                await db.ReceiptDetail.create({
                    receiptId: data.receiptId,
                    productDetailSizeId: data.productDetailSizeId,
                    quantity: data.quantity,
                    price: data.price,
                }
                )

                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}
let getDetailReceiptById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {

                let res = await db.Receipt.findOne({
                    where: { id: id }

                })
                
                // Đảm bảo receipt cũ có statusId mặc định
                if (res && !res.statusId) {
                    res.statusId = 'S1';
                }
                
                // Convert image to base64 string if exists
                if (res && res.image) {
                    res.image = Buffer.from(res.image, 'base64').toString('binary');
                }
                
                res.receiptDetail = await db.ReceiptDetail.findAll({ where: { receiptId: id } })
                if (res.receiptDetail && res.receiptDetail.length > 0) {
                    for (let i = 0; i < res.receiptDetail.length; i++) {

                        let productDetailSize = await db.ProductDetailSize.findOne({
                            where: { id: res.receiptDetail[i].productDetailSizeId },
                            include: [
                                { model: db.Allcode, as: 'sizeData', attributes: ['value', 'code'] },

                            ],
                            raw: true,
                            nest: true
                        })
                        res.receiptDetail[i].productDetailSizeData = productDetailSize
                        res.receiptDetail[i].productDetailData = await db.ProductDetail.findOne({ where: { id: productDetailSize.productdetailId } })
                        res.receiptDetail[i].productData = await db.Product.findOne({ where: { id: res.receiptDetail[i].productDetailData.productId } })

                    }
                }
                
                // Get user data
                res.userData = await db.User.findOne({ where: { id: res.userId }, attributes: { exclude: ['password'] } })
                res.supplierData = await db.Supplier.findOne({ where: { id: res.supplierId } })

                resolve({
                    errCode: 0,
                    data: res
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}
let getAllReceipt = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let objectFilter = {
                order: [['createdAt', 'DESC']]
            }
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }

            //  if(data.keyword !=='') objectFilter.where = {...objectFilter.where, name: {[Op.substring]: data.keyword  } }
            let res = await db.Receipt.findAndCountAll(objectFilter)
            for (let i = 0; i < res.rows.length; i++) {
                // Đảm bảo receipt cũ có statusId mặc định
                if (!res.rows[i].statusId) {
                    res.rows[i].statusId = 'S1';
                }
                res.rows[i].userData = await db.User.findOne({ where: { id: res.rows[i].userId } })
                res.rows[i].supplierData = await db.Supplier.findOne({ where: { id: res.rows[i].supplierId } })
            }
            resolve({
                errCode: 0,
                data: res.rows,
                count: res.count
            })
        } catch (error) {
            reject(error)
        }
    })
}
let updateReceipt = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.date || !data.supplierId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let receipt = await db.Receipt.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (receipt) {

                    receipt.supplierId = data.supplierId;
                    await receipt.save()
                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    })
                }
            }

        } catch (error) {
            reject(error)
        }
    })
}
let deleteReceipt = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let receipt = await db.Receipt.findOne({
                    where: { id: data.id }
                })
                if (receipt) {
                    await db.Receipt.destroy({
                        where: { id: data.id }
                    })
                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    })
                }
            }

        } catch (error) {
            reject(error)
        }
    })
}
// Xác nhận Receipt bởi Role R1 (Admin) hoặc R4 (Warehouse Manager) - update số lượng sản phẩm
// Trạng thái: S1=Chờ xác nhận, S2=Xác nhận đủ, S3=Xác nhận thiếu, S4=Hoàn thành, S5=Hủy nhập hàng
let confirmReceipt = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.confirmedBy || !data.receiptDetails) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Lấy thông tin receipt
                let receipt = await db.Receipt.findOne({
                    where: { id: data.id },
                    raw: false
                })
                
                if (!receipt) {
                    resolve({
                        errCode: 2,
                        errMessage: 'Receipt not found!'
                    })
                    return;
                }
                
                // Kiểm tra receipt đã được hoàn thành chưa
                if (receipt.statusId === 'S4') {
                    resolve({
                        errCode: 3,
                        errMessage: 'Receipt đã hoàn thành, không thể xác nhận lại!'
                    })
                    return;
                }
                
                // Lấy tất cả chi tiết receipt từ DB
                let receiptDetailsDB = await db.ReceiptDetail.findAll({
                    where: { receiptId: data.id },
                    raw: false
                })
                
                if (!receiptDetailsDB || receiptDetailsDB.length === 0) {
                    resolve({
                        errCode: 4,
                        errMessage: 'Receipt detail not found!'
                    })
                    return;
                }
                
                let totalExpected = 0;
                let totalActual = 0;
                let hasShortage = false;
                
                // Update số lượng thực tế và cập nhật stock cho từng sản phẩm
                for (let i = 0; i < receiptDetailsDB.length; i++) {
                    // Tìm actual quantity từ data gửi lên
                    let actualData = data.receiptDetails.find(
                        item => item.productDetailSizeId == receiptDetailsDB[i].productDetailSizeId
                    );
                    
                    let actualQty = actualData ? parseInt(actualData.actualQuantity) : receiptDetailsDB[i].quantity;
                    let expectedQty = receiptDetailsDB[i].quantity;
                    
                    totalExpected += expectedQty;
                    totalActual += actualQty;
                    
                    if (actualQty < expectedQty) {
                        hasShortage = true;
                    }
                    
                    // Lưu số lượng thực tế
                    receiptDetailsDB[i].actualQuantity = actualQty;
                    await receiptDetailsDB[i].save();
                    
                    // Cập nhật stock dựa trên số lượng thực tế
                    let productDetailSize = await db.ProductDetailSize.findOne({
                        where: { id: receiptDetailsDB[i].productDetailSizeId },
                        raw: false
                    })
                    
                    if (productDetailSize) {
                        productDetailSize.stock = (productDetailSize.stock || 0) + actualQty;
                        await productDetailSize.save();
                    }
                }
                
                // Xác định trạng thái dựa trên so sánh số lượng
                let newStatus = 'S2'; // Mặc định: Xác nhận đủ
                let message = 'Xác nhận receipt thành công! Số lượng đầy đủ.';
                
                if (hasShortage || totalActual < totalExpected) {
                    newStatus = 'S3'; // Xác nhận thiếu
                    message = `Xác nhận receipt thành công! Thiếu ${totalExpected - totalActual} sản phẩm.`;
                }
                
                // Cập nhật trạng thái receipt
                receipt.statusId = newStatus;
                receipt.confirmedBy = data.confirmedBy;
                if (data.image) {
                    receipt.image = data.image;
                }
                await receipt.save();
                
                resolve({
                    errCode: 0,
                    errMessage: message,
                    data: {
                        statusId: newStatus,
                        totalExpected: totalExpected,
                        totalActual: totalActual,
                        shortage: totalExpected - totalActual
                    }
                })
            }

        } catch (error) {
            reject(error)
        }
    })
}
// Đánh dấu Receipt đã hoàn thành (chuyển từ S2 hoặc S3 sang S4)
let completeReceipt = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let receipt = await db.Receipt.findOne({
                    where: { id: data.id },
                    raw: false
                })
                
                if (!receipt) {
                    resolve({
                        errCode: 2,
                        errMessage: 'Receipt not found!'
                    })
                    return;
                }
                
                // Chỉ có thể hoàn thành nếu đã xác nhận (S2 hoặc S3)
                if (receipt.statusId !== 'S2' && receipt.statusId !== 'S3') {
                    resolve({
                        errCode: 3,
                        errMessage: 'Receipt chưa được xác nhận hoặc đã hoàn thành!'
                    })
                    return;
                }
                
                receipt.statusId = 'S4'; // S4 = Hoàn thành
                await receipt.save();
                
                resolve({
                    errCode: 0,
                    errMessage: 'Hoàn thành receipt thành công!'
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}
// Hủy nhập hàng (chỉ áp dụng cho S3 - Xác nhận thiếu)
// Sẽ trừ lại số lượng đã cộng vào stock
let cancelReceipt = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let receipt = await db.Receipt.findOne({
                    where: { id: data.id },
                    raw: false
                })
                
                if (!receipt) {
                    resolve({
                        errCode: 2,
                        errMessage: 'Receipt not found!'
                    })
                    return;
                }
                
                // Chỉ có thể hủy receipt ở trạng thái S3 (Xác nhận thiếu)
                if (receipt.statusId !== 'S3') {
                    resolve({
                        errCode: 3,
                        errMessage: 'Chỉ có thể hủy receipt đang ở trạng thái "Xác nhận thiếu"!'
                    })
                    return;
                }
                
                // Lấy chi tiết receipt để trừ lại stock
                let receiptDetails = await db.ReceiptDetail.findAll({
                    where: { receiptId: data.id }
                })
                
                if (receiptDetails && receiptDetails.length > 0) {
                    // Trừ lại số lượng thực tế đã cộng vào stock
                    for (let i = 0; i < receiptDetails.length; i++) {
                        let actualQty = receiptDetails[i].actualQuantity || receiptDetails[i].quantity;
                        
                        let productDetailSize = await db.ProductDetailSize.findOne({
                            where: { id: receiptDetails[i].productDetailSizeId },
                            raw: false
                        })
                        
                        if (productDetailSize) {
                            // Trừ lại số lượng đã cộng
                            productDetailSize.stock = Math.max(0, (productDetailSize.stock || 0) - actualQty);
                            await productDetailSize.save();
                        }
                    }
                }
                
                // Cập nhật trạng thái receipt
                receipt.statusId = 'S5'; // S5 = Hủy nhập hàng
                await receipt.save();
                
                resolve({
                    errCode: 0,
                    errMessage: 'Hủy nhập hàng thành công! Đã hoàn trả số lượng vào kho.'
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}
module.exports = {
    createNewReceipt: createNewReceipt,
    getDetailReceiptById: getDetailReceiptById,
    getAllReceipt: getAllReceipt,
    updateReceipt: updateReceipt,
    deleteReceipt: deleteReceipt,
    createNewReceiptDetail: createNewReceiptDetail,
    confirmReceipt: confirmReceipt,
    completeReceipt: completeReceipt,
    cancelReceipt: cancelReceipt
}
