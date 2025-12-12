import db from "../models/index";
const { Op } = require("sequelize");
require('dotenv').config();

let createNewReview = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.content || !data.productId || !data.userId || !data.star) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Kiểm tra điều kiện: user phải có đơn hàng đã giao (S6) chứa sản phẩm này
                const eligible = await canUserReviewProduct(data.userId, data.productId);
                if (!eligible) {
                    resolve({
                        errCode: 2,
                        errMessage: 'Bạn cần đặt hàng và nhận hàng thành công trước khi đánh giá sản phẩm này.'
                    });
                    return;
                }
                await db.Comment.create({
                    content: data.content,
                    productId: data.productId,
                    userId: data.userId,
                    star: data.star,
                    image: data.image
                })
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
// Kiểm tra xem user có thể đánh giá sản phẩm không:
// Điều kiện: Phải có ít nhất 1 đơn hàng ĐÃ GIAO HÀNG (statusId = 'S6') chứa sản phẩm này
// S3 = Chờ xác nhận | S4 = Đã xác nhận | S5 = Đang giao | S6 = Đã giao | S7 = Đã hủy
let canUserReviewProduct = async (userId, productId) => {
    try {
        if (!userId || !productId) return false;
        
        // Chuyển đổi sang số để đảm bảo so sánh chính xác
        const userIdNum = parseInt(userId);
        const productIdNum = parseInt(productId);

        // Quyền R1 (Admin) và R4 (Warehouse) được phép đánh giá mà không cần đơn S6
        const user = await db.User.findOne({ where: { id: userIdNum }, raw: true });
        if (user && (user.roleId === 'R1' || user.roleId === 'R4')) {
            return true;
        }
        
        // Tìm tất cả địa chỉ của user
        const addresses = await db.AddressUser.findAll({ where: { userId: userIdNum }, raw: true });
        if (!addresses || addresses.length === 0) {
            console.log('No addresses found for user:', userIdNum);
            return false;
        }
        
        const addressIds = addresses.map(a => a.id);
        
        // Tìm các đơn hàng ĐÃ GIAO HÀNG (S6) của user
        const completedOrders = await db.OrderProduct.findAll({
            where: { addressUserId: { [Op.in]: addressIds }, statusId: 'S6' },
            raw: true
        });
        
        if (!completedOrders || completedOrders.length === 0) {
            console.log('No completed orders (S6) found for addresses:', addressIds);
            return false;
        }
        
        const orderIds = completedOrders.map(o => o.id);
        console.log('Found completed orders:', orderIds);
        
        // Lấy tất cả chi tiết đơn hàng
        const orderDetails = await db.OrderDetail.findAll({ 
            where: { orderId: { [Op.in]: orderIds } }, 
            raw: true 
        });
        
        if (!orderDetails || orderDetails.length === 0) {
            console.log('No order details found for orders:', orderIds);
            return false;
        }
        
        // Kiểm tra từng chi tiết để tìm sản phẩm
        for (let i = 0; i < orderDetails.length; i++) {
            // OrderDetail.productId là ProductDetailSize.id
            const pds = await db.ProductDetailSize.findOne({ 
                where: { id: orderDetails[i].productId }, 
                raw: true 
            });
            
            if (!pds) continue;
            
            // Lấy ProductDetail từ ProductDetailSize
            const pd = await db.ProductDetail.findOne({ 
                where: { id: pds.productdetailId }, 
                raw: true 
            });
            
            if (!pd) continue;
            
            // So sánh productId (chuyển sang số)
            if (parseInt(pd.productId) === productIdNum) {
                console.log('Product match found! User can review product:', productIdNum);
                return true;
            }
        }
        
        console.log('Product not found in any completed orders for user:', userIdNum, 'productId:', productIdNum);
        return false;
    } catch (error) {
        console.error('Error in canUserReviewProduct:', error);
        return false;
    }
}
let getAllReviewByProductId = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let res = await db.Comment.findAll({
                    where: {
                        productId: id
                    },
                    raw: true
                })

                if (res && res.length > 0) {

                    for (let i = 0; i < res.length; i++) {
                        res[i].image = res[i].image ? Buffer.from(res[i].image, 'base64').toString('binary') : ''

                        res[i].childComment = await db.Comment.findAll({ where: { parentId: res[i].id } })
                        res[i].user = await db.User.findOne(
                            {
                                where: { id: res[i].userId },
                                attributes: {
                                    exclude: ['password']
                                },
                            })
                        // Người dùng có thể chưa có ảnh -> cần kiểm tra null
                        res[i].user.image = res[i].user?.image
                            ? Buffer.from(res[i].user.image, 'base64').toString('binary')
                            : ''
                    }
                }

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
let ReplyReview = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.content || !data.productId || !data.userId || !data.parentId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                await db.Comment.create({
                    content: data.content,
                    productId: data.productId,
                    userId: data.userId,
                    parentId: data.parentId
                })
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
let deleteReview = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let review = await db.Comment.findOne({
                    where: { id: data.id }
                })
                if (review) {
                    await db.Comment.destroy({
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
let createNewComment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.content || !data.blogId || !data.userId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                await db.Comment.create({
                    content: data.content,
                    blogId: data.blogId,
                    userId: data.userId,
                    image: data.image
                })
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
let getAllCommentByBlogId = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let res = await db.Comment.findAll({
                    where: {
                        blogId: id
                    },
                    order: [['createdAt', 'DESC']],
                    raw: true
                })

                if (res && res.length > 0) {

                    for (let i = 0; i < res.length; i++) {
                        res[i].image = res[i].image ? Buffer.from(res[i].image, 'base64').toString('binary') : ''

                        res[i].childComment = await db.Comment.findAll({ where: { parentId: res[i].id } })
                        res[i].user = await db.User.findOne(
                            {
                                where: { id: res[i].userId },
                                attributes: {
                                    exclude: ['password']
                                },
                            })
                        res[i].user.image = res[i].user?.image
                            ? Buffer.from(res[i].user.image, 'base64').toString('binary')
                            : ''
                    }
                }

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
let ReplyComment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.content || !data.blogId || !data.userId || !data.parentId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                await db.Comment.create({
                    content: data.content,
                    blogId: data.blogId,
                    userId: data.userId,
                    parentId: data.parentId
                })
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
let deleteComment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let comment = await db.Comment.findOne({
                    where: { id: data.id }
                })
                if (comment) {
                    await db.Comment.destroy({
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
module.exports = {
    createNewReview: createNewReview,
    getAllReviewByProductId: getAllReviewByProductId,
    ReplyReview: ReplyReview,
    deleteReview: deleteReview,
    createNewComment:createNewComment,
    getAllCommentByBlogId:getAllCommentByBlogId,
    deleteComment:deleteComment,
    ReplyComment:ReplyComment,
    canUserReviewProduct: canUserReviewProduct
}
