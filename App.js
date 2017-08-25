import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableHighlight, FlatList, Button, AsyncStorage } from 'react-native';
import twitter from 'react-native-twitter';
import firebase from './firebase';

const CONSUMER_KEY = 'hHx5eivE4jj2eAmGoiXIB4HjD';
const CONSUMER_SECRET = 'nVx3ORIlIQYovjZFw0kW9UMmD8xAcnPyYZ2lPcDYisYBerg0Mb';
const ACCESS_TOKEN = '181565054-kjXpkJ2xQtcGK4zuConSAdoma9l5KBmyVlgymnA2';
const ACCESS_TOKEN_SECRET = 'nl2QQrEDeUAmiYwdJrQey6XsRVZa1TPHxrwTIsk7OudHp';
const SET_QUERY_API = `https://fvmylcig0b.execute-api.us-west-2.amazonaws.com/prod/tweets`;

const client = twitter({
    consumerKey: CONSUMER_KEY,
    consumerSecret: CONSUMER_SECRET,
    accessToken: ACCESS_TOKEN,
    accessTokenSecret: ACCESS_TOKEN_SECRET
});

export default class App extends React.Component {
    state = {
        isQuerySet: false,
        query: '',
        tweets: []
    }

    componentWillMount() {
        AsyncStorage.getItem('query', (error, result) => {
            if (result) {
                this.setState({
                    isQuerySet: true,
                    query: result
                });
            }
        });
    }

    componentDidMount() {
        firebase.messaging().getToken()
            .then((token) => {
                this.fcm_token = token;
            });

        // when app is running
        firebase.messaging().onMessage((data) => {
            const tweets = JSON.parse(data.message);
            this.setState({
                tweets
            });
        });

        // when app is started by notification
        firebase.messaging().getInitialNotification()
            .then((notification) => {
                if (notification && notification.message) {
                    const tweets = JSON.parse(notification.message);
                    this.setState({
                        tweets
                    });
                }
            });
    }

    handleSetPress() {
        fetch(SET_QUERY_API, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: this.state.query,
                fcm_token: this.fcm_token
            })
        })
            .then(response => response.json())
            .then(json => {
                this.setState({
                    isQuerySet: true,
                    tweets: json
                });
                AsyncStorage.setItem('query', this.state.query);
            });
    }

    handleRetweet(id) {
        client.rest.post('statuses/retweet/:id', { id })
            .then(() => {
                let { tweets } = this.state;
                tweets = tweets.slice();
                const index = tweets.findIndex(t => t.id === id);
                if (index !== -1) {
                    tweets[index] = {
                        ...tweets[index],
                        retweeted: true
                    };
                    this.setState({ tweets });
                }
            });
    }

    handleReset() {
        // call API
        AsyncStorage.removeItem('query');
        this.setState({
            query: '',
            isQuerySet: false,
            tweets: []
        });
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.isQuerySet ? (
                    <View style={styles.column}>
                        <View style={styles.row}>
                            <Text style={{ fontSize: 20 }}>Search for {this.state.query}</Text>
                            <Button
                                title="Reset"
                                onPress={this.handleReset.bind(this)}
                            />
                        </View>
                        <Text style={styles.heading}>Tweets in the last one hour</Text>
                        <FlatList
                            style={styles.flatList}
                            data={this.state.tweets}
                            keyExtractor={(item, index) => index}
                            renderItem={({ item }) => (
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.text}>{item.text}</Text>
                                    {item.retweeted ? (
                                        <Text>Retweeted</Text>
                                    ) : (
                                            <Button
                                                title="Retweet"
                                                onPress={this.handleRetweet.bind(this, item.id)}
                                            />
                                        )}
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
        padding: 5,
        marginLeft: 20,
        marginRight: 20
    },
    flatList: {
        marginTop: 15,
        marginLeft: 20,
        marginRight: 20
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
