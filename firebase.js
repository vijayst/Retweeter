import RNFirebase from 'react-native-firebase';

const configurationOptions = {
    debug: true
};

const firebase = RNFirebase.initializeApp(configurationOptions);

firebase.messaging().getToken()
    .then((token) => {
        console.warn('Device FCM Token: ', token);
    });

export default firebase;