import React, { useContext, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
import OrderScreen from './OrderScreen';
import InfoScreen from './InfoScreen';
import WorkingOrderScreen from './WorkingOrderScreen';
import DoneOrderScreen from './DoneOrderScreen';
const Tab = createBottomTabNavigator();
const HomeScreen = ({ navigation }) => {


    const orderName = "Home";
    const detailsName = "Details";
    const working = "Working";
    const done = "Done";
    return (
        <Tab.Navigator
            initialRouteName={orderName}

            tabBarOptions={{
                activeTintColor: 'tomato',
                inactiveTintColor: 'grey',
                labelStyle: { paddingBottom: 10, fontSize: 10 },
                style: { padding: 10, height: 70 }
            }}>

            <Tab.Screen name={orderName} component={OrderScreen}
                options={{
                    tabBarLabel: 'Đơn hàng',
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name={"car"} size={size} color={color} />
                    ),
                    unmountOnBlur: true

                }}
                listeners={({ navigation }) => ({
                    blur: () => navigation.setParams({ screen: undefined }),
                })}
            />
            <Tab.Screen name={working} component={WorkingOrderScreen}
                options={{
                    tabBarLabel: 'Đang làm',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name={"list"} size={size} color={color} />
                    ),
                    unmountOnBlur: true
                }}
                listeners={({ navigation }) => ({
                    blur: () => navigation.setParams({ screen: undefined }),
                })}

            />
            <Tab.Screen name={done} component={DoneOrderScreen}
                options={{
                    tabBarLabel: 'Đã hoàn thành',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name={"work-outline"} size={size} color={color} />
                    ),
                    unmountOnBlur: true
                }}
                listeners={({ navigation }) => ({
                    blur: () => navigation.setParams({ screen: undefined }),
                })}

            />
            <Tab.Screen name={detailsName} component={InfoScreen}
                options={{
                    tabBarLabel: 'Thông tin',
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name={"user"} size={size} color={color} />
                    ),
                    unmountOnBlur: true
                }}
            />


        </Tab.Navigator>
    );
};

export default HomeScreen;
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50
    }

});