import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableHighlight, FlatList, Button } from 'react-native';
import firebase from './firebase';

export default class App extends React.Component {
    state = {
        isQuerySet: false,
        query: '',
        tweets: []
    }

    componentDidMount() {
        firebase.messaging().getToken()
            .then((token) => {
                console.log('Device FCM Token: ', token);
            });

        // when app is running
        firebase.messaging().onMessage((data) => {
            const tweets = JSON.parse(data.message);
            this.setState({
                isQuerySet: true,
                tweets
            });
        });

        // when app is started by notification
        firebase.messaging().getInitialNotification()
            .then((notification) => {
                const tweets = JSON.parse(notification.message);
                this.setState({
                    isQuerySet: true,
                    tweets
                });
            });
    }

    handleSetPress() {
        fetch(`https://fvmylcig0b.execute-api.us-west-2.amazonaws.com/prod/tweets?query=${encodeURIComponent(this.state.query)}`)
            .then(response => response.json())
            .then(json => {
                this.setState({
                    isQuerySet: true,
                    tweets: json
                });
            });
    }

    handleRetweet() {

    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.isQuerySet ? (
                    <View style={styles.column}>
                        <Text style={styles.heading}>Tweets in the last one hour</Text>
                        <FlatList
                            data={this.state.tweets}
                            keyExtractor={(item, index) => index}
                            renderItem={({ item }) => (
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.text}>{item.text}</Text>
                                    <Button
                                        title="Retweet"
                                        onPress={this.handleRetweet.bind(this)}
                                    />
                                </View>
                            )}
                        />
                    </View>
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
    column: {
        justifyContent: 'space-between',
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
    },
    heading: {
        backgroundColor: '#0047AB',
        color: '#FFF',
        fontSize: 20,
        padding: 5
    },
    name: {
        backgroundColor: '#ccc',
        fontSize: 18,
        padding: 5
    },
    text: {
        fontSize: 14,
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10
    }
});
