import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Button,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { updateImageOrderService } from '../services/userService'
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';

const TakePhoto = ({ route, navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const [image, setImage] = useState(null);
    const [facing, setFacing] = useState('back');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const { orderId } = route.params;

    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission]);

    const takePicture = async () => {
        if (!permission?.granted) {
            Alert.alert('Không có quyền camera', 'Vui lòng cấp quyền truy cập camera trong Cài đặt.');
            return;
        }

        if (!isCameraReady || !cameraRef.current) {
            Alert.alert('Camera chưa sẵn sàng');
            return;
        }

        try {
            setIsProcessing(true);

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.7,
                base64: true,
                skipProcessing: false,
            });

            if (!photo?.uri) {
                throw new Error('Không lấy được ảnh từ camera');
            }

            let base64Image = "";

            if (photo.base64) {
                base64Image = "data:image/jpeg;base64," + photo.base64;
            } else {
                try {
                    const base64 = await FileSystem.readAsStringAsync(photo.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    base64Image = "data:image/jpeg;base64," + base64;
                } catch (readError) {
                    console.error('Error reading file:', readError);
                    throw new Error('Không thể đọc dữ liệu ảnh. Vui lòng thử lại.');
                }
            }

            if (!base64Image) {
                throw new Error('Không lấy được dữ liệu ảnh');
            }

            setImage(base64Image);

            const res = await updateImageOrderService({
                id: orderId,
                image: base64Image,
            });

            if (res?.errCode === 0) {
                Alert.alert("Thành công", "Lưu ảnh thành công");
            } else {
                Alert.alert("Lỗi", res?.errMessage || "Lưu ảnh thất bại");
            }
        } catch (err) {
            console.error("Take picture error:", err);
            Alert.alert("Lỗi chụp ảnh", err.message || String(err));
        } finally {
            setIsProcessing(false);
        }
    };

    if (!permission) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={{ marginBottom: 20 }}>No Camera Access</Text>
                <Button title="Cấp quyền camera" onPress={requestPermission} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.cameraContainer}>
                <CameraView
                    ref={cameraRef}
                    style={styles.fixedRatio}
                    facing={facing}
                    onCameraReady={() => setIsCameraReady(true)}
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Lật máy ảnh"
                    onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                    disabled={isProcessing}
                />

                <Button
                    title={isProcessing ? 'Đang xử lý...' : 'Chụp ảnh'}
                    onPress={takePicture}
                    disabled={isProcessing || !isCameraReady}
                />
            </View>

            {isProcessing && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.loadingText}>Đang xử lý ảnh...</Text>
                </View>
            )}

            {image && (
                <View style={styles.previewContainer}>
                    <Text style={styles.previewText}>Ảnh đã chụp:</Text>
                    <Image
                        source={{ uri: image }}
                        style={styles.previewImage}
                        resizeMode="contain"
                    />
                </View>
            )}
        </View>
    );
};

export default TakePhoto;

const styles = StyleSheet.create({
    cameraContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    fixedRatio: {
        flex: 1,
        aspectRatio: 1,
    },
    buttonContainer: {
        padding: 10,
        gap: 12,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    previewContainer: {
        padding: 10,
        maxHeight: 220,
    },
    previewText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    previewImage: {
        width: '100%',
        height: 200,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
