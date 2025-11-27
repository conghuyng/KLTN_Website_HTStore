import React, { useContext, useState, useEffect } from 'react';
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

import { getAllOrdersByShipper } from '../services/userService'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OrderItem from '../screens/OrderItem'
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();
const WorkingOrderScreen = ({ navigation }) => {



    const [userData, setuserData] = useState({});
    const [dataOrder, setdataOrder] = useState([])
    useEffect(() => {
        const focusHandler = navigation.addListener('focus', () => {
            AsyncStorage.getItem('userData').then((value) => {
                if (value) {
                    setuserData(JSON.parse(value))
                    loadOrderData(JSON.parse(value).id)
                }
            });

        });

        return focusHandler;


    }, [navigation])
    let loadOrderData = (shipperId) => {
        try {
            let fetchData = async () => {
                let arrData = await getAllOrdersByShipper({

                    status: 'working',
                    shipperId: shipperId

                })
                if (arrData && arrData.errCode === 0) {
                    setdataOrder(arrData.data)

                }
            }
            fetchData();
        } catch (error) {
            console.log(error)
        }
    }
    let handleClickItem = (id) => {

        navigation.navigate('DetailOrderScreen', {
            orderId: id
        })

    }
    return (
        <View contentContainerStyle={styles.container}>
            <ScrollView>
                {dataOrder && dataOrder.length > 0 &&
                    dataOrder.map((item, index) => {
                        return (
                            <OrderItem handleClickItem={handleClickItem} data={item} key={index} />
                        )
                    })
                }

            </ScrollView>

        </View>



    );
};

export default WorkingOrderScreen;
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',


    },
    wrapContent: {
        display: 'flex',
        flexDirection: 'row',
        paddingLeft: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,

        elevation: 5,
        height: 120
    },
    avatar: {
        width: 80, height: 80, borderRadius: 50
    }


});