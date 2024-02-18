import React, { useState, useEffect } from 'react';
import { View, Button, Image, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
    const [images, setImages] = useState([]);

    const addImage = (image) => {
        setImages((prevImages) => [...prevImages, { id: String(prevImages.length), uri: image }]);
    };

    return (
        <View style={styles.container}>
            <CameraScreen navigation={navigation} addImage={addImage} />
            <FlatList
                style={styles.imageList}
                horizontal
                data={images}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('ImageView', { images, currentImageId: item.id })}>
                        <Image source={{ uri: item.uri }} style={styles.image} />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const CameraScreen = ({ navigation, addImage }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [camera, setCamera] = useState(null);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const takePicture = async () => {
        if (camera) {
            const photo = await camera.takePictureAsync();
            addImage(photo.uri);
        }
    };

    return (
        <View style={styles.cameraContainer}>
            <Camera style={styles.camera} type={type} ref={(ref) => setCamera(ref)}>
                <Button title="Take Picture" onPress={takePicture} />
            </Camera>
        </View>
    );
};

const ImageViewScreen = ({ route }) => {
    const { images, currentImageId } = route.params;

    const currentImage = images.find((image) => image.id === currentImageId);

    return (
        <View style={styles.imageViewContainer}>
            <Image source={{ uri: currentImage.uri }} style={styles.fullImage} />
            <Text style={styles.imageCaption}>Image {currentImageId}</Text>
        </View>
    );
};

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="ImageView" component={ImageViewScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    cameraContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    imageList: {
        maxHeight: 200,
        marginVertical: 10,
    },
    image: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
    imageViewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '80%',
        resizeMode: 'contain',
    },
    imageCaption: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default App;
