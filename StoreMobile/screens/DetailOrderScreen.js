import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    ScrollView,
    Linking
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { handleLoginService } from '../services/userService'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FormButton from '../components/FormButton';
import { useEffect } from 'react';
import { getDetailOrder, confirmOrder } from '../services/userService'
const Tab = createBottomTabNavigator();
import AsyncStorage from '@react-native-async-storage/async-storage';

const DetailOrderScreen = ({ route, navigation }) => {

    const { orderId } = route.params;

    let handleSendProduct = async () => {
        let res = await confirmOrder({
            orderId: orderId,
            statusId: 'S5',
            shipperId: userData.id
        })
        if (res && res.errCode == 0) {
            loadDataOrder()
        }
    }

    let handleSuccessShip = async () => {
        if (!DataOrder.image) {
            alert("Chụp ảnh trước khi hoàn thành đơn")
        } else {
            let res = await confirmOrder({
                orderId: orderId,
                statusId: 'S6',
                shipperId: userData.id
            })
            if (res && res.errCode == 0) {
                loadDataOrder()
            }
        }
    }

    const openMap = async (address) => {
        const provider = Platform.OS === 'ios' ? 'apple' : 'google'
        const link = `http://maps.${provider}.com/?daddr=${address}`;

        try {
            const supported = await Linking.canOpenURL(link);
            if (supported) Linking.openURL(link);
        } catch (error) {
            console.log(error);
        }
    }

    const [priceShip, setpriceShip] = useState(0)
    const [price, setprice] = useState(0)
    const [DataOrder, setDataOrder] = useState({});
    const [userData, setuserData] = useState({});

    useEffect(() => {
        const focusHandler = navigation.addListener('focus', () => {
            AsyncStorage.getItem('userData').then((value) => {
                if (value) {
                    setuserData(JSON.parse(value))
                    loadDataOrder()
                }
            });
        });
        return focusHandler;
    }, [navigation])

    let loadDataOrder = () => {
        if (orderId) {
            let fetchOrder = async () => {
                let order = await getDetailOrder(orderId)
                if (order && order.errCode == 0) {
                    setDataOrder(order.data)
                    setpriceShip(order.data.typeShipData.price)
                    let price = 0;

                    order.data.orderDetail.map((item) => {
                        price += item.quantity * item.productDetail.discountPrice
                    })
                    setprice(price)
                }
            }
            fetchOrder()
        }
    }

    let totalPriceDiscount = (price, discount) => {
        try {
            if (discount.typeVoucherOfVoucherData.typeVoucher === "percent") {
                if (((price * discount.typeVoucherOfVoucherData.value) / 100) > discount.typeVoucherOfVoucherData.maxValue) {
                    return price - discount.typeVoucherOfVoucherData.maxValue
                } else {
                    return price - ((price * discount.typeVoucherOfVoucherData.value) / 100)
                }
            } else {
                return price - discount.typeVoucherOfVoucherData.maxValue
            }
        } catch (error) { }
    }

    const handleTakePhoto = () => {
        navigation.navigate("TakePhoto", {
            orderId: orderId
        })
    }

    return (
        <ScrollView>
            <View contentContainerStyle={styles.container}>
                {DataOrder && DataOrder.typeShipData &&
                    <>
                        <View style={styles.box_top}>
                            <View style={{ borderBottomColor: 'white', borderBottomWidth: 1 }}>
                                <Text style={{ color: 'white', fontSize: 20 }}>{DataOrder.typeShipData.type}</Text>
                                <Text style={{ color: 'white', fontSize: 14 }}>Mã đơn: {orderId}</Text>
                            </View>
                            <View style={{ borderBottomColor: 'white', borderBottomWidth: 1 }}>
                                <Text style={{ color: 'white', marginTop: 10 }}>{DataOrder.addressUser.shipName} ({DataOrder.addressUser.shipPhonenumber})</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                                    <Text style={{ color: 'white', marginTop: 10, width: 300 }}>{DataOrder.addressUser.shipAdress}</Text>
                                    <Ionicons onPress={() => openMap(DataOrder.addressUser.shipAdress)} name={"map-outline"} color={'orange'} size={20} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ color: 'white' }}>Thu tiền: </Text>
                                    {DataOrder && DataOrder.isPaymentOnlien == 0 ?
                                        <Text style={{ color: 'orange' }}>{DataOrder?.voucherData && DataOrder.voucherId ? totalPriceDiscount(price, DataOrder.voucherData) + priceShip : price + (+priceShip)}$</Text>
                                        : <Text style={{ color: 'orange' }}>0đ</Text>
                                    }
                                </View>
                                <Text style={{ marginLeft: 10, color: 'red', fontWeight: '600', padding: 4, borderRadius: 4, backgroundColor: 'white' }}>Lấy ngay</Text>
                            </View>
                        </View>

                        <View style={{ backgroundColor: 'white', alignItems: 'center', padding: 10, fontWeight: '700' }}>
                            <Text>Trạng thái : {DataOrder.statusOrderData.value}</Text>
                        </View>

                        <View style={{ backgroundColor: 'white', marginTop: 5, padding: 10 }}>
                            <Text style={{ borderBottomColor: 'black', borderBottomWidth: 1 }}>Chi tiết đơn hàng</Text>

                            <View style={{ marginTop: 10 }}>
                                {DataOrder.orderDetail?.length > 0 &&
                                    DataOrder.orderDetail.map((item, index) => {
                                        let name = `${item.product.name} - ${item.productDetail.nameDetail} - ${item.productDetailSize.sizeData.value}`;
                                        return (
                                            <View
                                                key={index}
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    borderBottomColor: '#75b5d8',
                                                    borderBottomWidth: 1
                                                }}
                                            >
                                                <Text style={styles.text_product}>{name}</Text>
                                                <Text style={styles.text_quantity}>x{item.quantity}</Text>
                                            </View>
                                        )
                                    })
                                }
                            </View>

                            <Text style={{ marginTop: 10 }}>Hình ảnh đơn hàng</Text>
                            <Image style={{ width: 200, height: 200 }} source={{ uri: DataOrder.image }} />
                        </View>

                        <View style={{ marginBottom: 10 }}>
                            {DataOrder?.statusId == 'S4' &&
                                <FormButton buttonTitle="Nhận đơn" onPress={handleSendProduct} />
                            }
                            {DataOrder?.statusId == 'S5' &&
                                <FormButton buttonTitle="Đã giao hàng" onPress={handleSuccessShip} />
                            }
                            {DataOrder && !DataOrder.image && DataOrder.statusId == 'S5' &&
                                <FormButton buttonTitle="Chụp ảnh" onPress={handleTakePhoto} />
                            }
                        </View>
                    </>
                }
            </View>
        </ScrollView>
    );
};

export default DetailOrderScreen;

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
    },
    box_top: {
        backgroundColor: '#484e54',
        padding: 10,
    },
    text_product: {
        fontSize: 18,
        color: '#75b5d8',
        fontStyle: 'italic',
        width: 320
    },
    text_quantity: {
        marginLeft: 20,
        color: 'red',
        fontSize: 18
    }
});
