import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableHighlight } from 'react-native';
import firebase from './firebase';

export default class App extends React.Component {
    state = {
        isQuerySet: false,
        query: ''
    }

    componentDidMount() {
        firebase.messaging().getToken()
            .then((token) => {
                console.warn('Device FCM Token: ', token);
            });
    }

    handleSetPress() {
        fetch(`https://fvmylcig0b.execute-api.us-west-2.amazonaws.com/prod/tweets?query=${encodeURIComponent(this.state.query)}`)
        .then(response => response.json())
        .then(json => {
            console.log(json);
            this.setState({ isQuerySet: true });
        });
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.isQuerySet ? (
                    <Text>Tweets in the last one hour</Text>
                ) : (
                    <View style={styles.row}>
                        <TextInput 
                            style={styles.input}
                            value={this.state.query}
                            onChangeText={query => this.setState({ query })}
                        />
                        <TouchableHighlight style={styles.button} onPress={this.handleSetPress.bind(this)}>
                            <Text style={styles.buttonText}>Set</Text>
                        </TouchableHighlight>
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 20
    },
    input: {
        flex: 1,
        fontSize: 20
    },
    button: {
        width: 100,
        backgroundColor: '#0047AB',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        padding: 10
    },
    buttonText: {
        color: '#FFF',
        fontSize: 20
    }
});
