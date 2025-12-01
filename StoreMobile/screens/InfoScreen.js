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
import moment from 'moment'
import 'moment/locale/vi'
import { getDetailUserById } from '../services/userService'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Tab = createBottomTabNavigator();
const InfoScreen = ({ navigation }) => {
    const [userId, setuserId] = useState(0);
    const [dataUser, setudataUser] = useState({});
    useEffect(() => {
        const focusHandler = navigation.addListener('focus', () => {
            AsyncStorage.getItem('userData').then((value) => {
                if (value) {
                    loadDataUser(JSON.parse(value).id)
                }
            });

        });

        return focusHandler;


    }, [navigation])
    let loadDataUser = async (userId) => {

        let res = await getDetailUserById(userId)
        if (res && res.errCode === 0) {
            setudataUser(res.data)

        }
    }


    return (
        <ScrollView contentContainerStyle={styles.container}>

            <Image source={{ uri: 'https://img2.thuthuatphanmem.vn/uploads/2018/12/30/anh-background-cuc-dep_110341116.jpg' }} style={styles.background}></Image>
            <View style={styles.boxInfo}>
                <View style={styles.boxDes}>
                    <Text>Hình ảnh</Text>
                    <Image source={{ uri: dataUser.image }} style={styles.avatar}></Image>

                </View>
                <View style={styles.boxDes}>
                    <Text>Mã tài xế</Text>
                    <Text>{dataUser.id}</Text>

                </View>
                <View style={styles.boxDes}>
                    <Text>Họ và tên</Text>
                    <Text>{dataUser.firstName + " " + dataUser.lastName}</Text>

                </View>
                <View style={styles.boxDes}>
                    <Text>Số điện thoại</Text>
                    <Text>{dataUser.phonenumber}</Text>

                </View>
                <View style={styles.boxDes}>
                    <Text>Email</Text>
                    <Text>{dataUser.email}</Text>

                </View>
                <View style={styles.boxDes}>
                    <Text>Ngày sinh</Text>
                    <Text>{moment.unix(+dataUser.dob / 1000).locale('vi').format('DD/MM/YYYY')}</Text>

                </View>
            </View>
        </ScrollView>
    );
};

export default InfoScreen;
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',

    },
    background: {
        width: '100%',
        height: 150,

    },
    avatar: {
        width: 50, height: 50, borderRadius: 50
    },
    boxDes: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1,
        padding: 10
    },
    boxInfo: {
        width: '100%',

    }


});