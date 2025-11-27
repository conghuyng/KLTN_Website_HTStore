import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    StyleSheet,
    ScrollView
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign'

import { handleLoginService } from '../services/userService'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();
const OrderItem = (props) => {


    let { data } = props
    let handleClickItem = (id) => {
        props.handleClickItem(id)
    }
    return (
        <View contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => handleClickItem(data.id)}>
                <View style={styles.wrapContent}>
                    <Image source={{ uri: 'https://file.hstatic.net/1000191021/file/4-icon-shipper_9937d5a87ccd40c686194426bf740106_grande.png' }} style={styles.avatar} />
                    <View style={{ display: 'flex', paddingLeft: 10, paddingTop: 10 }}>
                        <Text>Mã đơn: {data.id}</Text>

                        <Text>Giá tiền: {data.typeShipData.price}đ</Text>
                        <Text>Loại: {data.typeShipData.type}</Text>
                        <Text>Hình thức: {data.isPaymentOnlien == 0 ? 'Thanh toán trực tiếp' : 'Thanh toán online'}</Text>
                    </View>
                </View>
            </TouchableOpacity>




        </View>
    );
};

export default OrderItem;
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',


    },
    wrapContent: {
        display: 'flex',
        flexDirection: 'row',
        paddingLeft: 10,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,

        elevation: 3,
        height: 120,
        borderBottomWidth: 1,
        borderBottomColor: 'grey',


    },
    avatar: {
        width: 80, height: 80, borderRadius: 50
    }

});