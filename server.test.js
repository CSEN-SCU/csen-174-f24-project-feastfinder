const io = require('socket.io-client');
import { waitFor } from '@testing-library/react'
const http = require('http');
const ioBack = require('socket.io');

//NOTE: use jest to test server & use vitest to test react components ( change the npm run test in root)


let socket;
let httpServer;
let httpServerAddr;
let ioServer;

//for test their should be a [proper] and [improper] way to send or request data from server
describe('Unit Testing Server - Route Connections', () => {

    //post requests
    // fetch('/login/google');
    // fetch('/create-group');
    // fetch('/join-group');

    //get requests

    // it('get group details by groupID  [CORRECT]', (done) => {
    //     fetch('/group/:groupId', + new URLSearchParams({
    //         groupId: 121212,
    //         bar: 2,
    //     }).toString())
    // })

});

describe('Unit Testing Server - Socket Connections', () => {
    let newSocket;

    // Run before all tests
    beforeAll((done) => {
        newSocket = io('http://localhost:3000', { transports: ['websocket'] });
        newSocket.on('connect', () => {
            done();
        });
    })
      
    // Run after all tests
    afterAll((done) => {
        // Cleanup
        if (newSocket.connected) {
            newSocket.disconnect();
        }
        done();
    });

    it('receive group id client listen [CORRECT]', (done) => {
        newSocket.on('receiveGroup', (data) => {
            expect(data).toBe(121212);
            done();
        })
    })

    it('start-page client emit [CORRECT]', (done) => {
        newSocket.emit('start-page', {name: 'john doe', img: 'src.png', status: 2}, (res) => {
            expect(res).toBe('user added');
            done();
        })
    });
    // it.todo('start-page emit for client [produce ERROR]');

    it('update-status client emit [CORRECT]', (done) => {
        newSocket.emit('update-status', {name: 'john doe', status: 1}, (res) => {
            expect(res).toBe('user updating');
            done();
        })
    });
    // it.todo('update-status client emit [produce ERROR]');

    it('status-all client emit [CORRECT]', (done) => {
        newSocket.emit('status-all', (data) => {
            expect(data.length).toBe(1);
            done();
        })
    });
    // it.todo('status-all client emit [produce ERROR]');

    //should be cuisine
    it('user-pref client emit [CORRECT]', (done) => {
        newSocket.emit('user-pref', ['chinese','american','french'], (res) => {
            expect(res).toStrictEqual(true);
            done();
        })
    });

    it('all users ready client listen [CORRECT]', (done) => {
        newSocket.on('all-ready', (data) => {
            expect(data.ready).toStrictEqual(true);
            done();
        })
    })

    //resturants picks
    it('resturant picks client listen [CORRECT]', (done) => {
        newSocket.emit('generate-resturants', 1, (d) => {
            expect(d).toBe('working');
        })
        newSocket.on('rest-picks', (data) => {
            expect(data.length).toStrictEqual(2);
            done();
        })
    })
    //vote done
    it('is vote done client listen [CORRECT]', (done) => {
        newSocket.emit('is-vote-done', [
            {"Business Name": "Serious Dumpling 正经生煎", 'voteCount': 1},
            {"Business Name": "Skewers & Brew", 'voteCount': 5},
            {"Business Name": "Urban Momo", 'voteCount': 3},
            {"Business Name": "Nam Vang Restaurant", 'voteCount': 2},
            {"Business Name": "Jade Cathay", 'voteCount': 3},
            {"Business Name": "Taiwan Restaurant", 'voteCount': 4},
        ], (d) => {
            expect(d).toBe('working');
        })
        newSocket.on('vote-results', (data) => {
            expect(data.length).toStrictEqual(3);
            done();
        })
    })


})

describe('Testing Multiple Users {Feature Testing}', () => {
});


//Note: 
//weird -> seems socket.emit must be nested in a socket.on in sever

//proof that socket.emit must be nested in a socket.on on server side
// it('hello world', (done) => {
//     newSocket.emit('hello', 'blank');
//     newSocket.on('world', (data) => {
//         expect(data).toBe('marioWorld!');
//         done();
//     })
//     newSocket.on('yolo', (data) => {
//         expect(data).toBe('yeye');
//         done();
//     })
// })