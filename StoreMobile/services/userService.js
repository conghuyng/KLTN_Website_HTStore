import axios from "../axios";
const handleLoginService = (data) => {
    return axios.post(`/api/login`, data)

}
const getAllOrder = (data) => {
    return axios.get(`/api/get-all-order?limit=${data.limit}&offset=${data.offset}&statusId=${data.statusId}`)
}
const getDetailOrder = (id) => {
    return axios.get(`/api/get-detail-order?id=${id}`)
}
const confirmOrder = (data) => {
    return axios.put(`/api/confirm-order`, data)
}
const getAllOrdersByShipper = (data) => {

    return axios.get(`/api/get-all-order-by-shipper?shipperId=${data.shipperId}&status=${data.status}`)
}
const getDetailUserById = (id) => {
    return axios.get(`/api/get-detail-user-by-id?id=${id}`)

}
const updateImageOrderService = (data) => {
    return axios.put(`/api/update-image-order`, data)
}
export {
    handleLoginService, getAllOrder, getDetailOrder, confirmOrder, getAllOrdersByShipper, getDetailUserById, updateImageOrderService
}