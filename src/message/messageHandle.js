/* jslint esversion: 6 */
import util from "util";
import EventEmitter from "events";
import MessageUtil from "../message/MessageUtil";
import ReconnectingWebSocket from "../lib/reconnectingWebSocket";
import DataProvider from '../localStorage/dataProvider';

var MessageHandle = function(clientId) {
    EventEmitter.call(this);

    this.messageUtil = new MessageUtil(clientId);

    this.clientId = clientId;
    this.receiveMessageQuene = {};
    this.sendMessageQuene = {};

    this.messageResponseTimeout = 2;

    var pingTimer = null;
    var checkSendMessageTimer = null;
    var checkReceiveMessageTimer = null;
    var lastReceivePongTime = 0;

    var socket = new ReconnectingWebSocket(address, null, {
        debug: true,
        reconnectInterval: 3000,
        binaryType: "arraybuffer",
        maxReconnectAttempts: 3
    });
    socket.onopen = function() {
        // this.emit('connectionStatus', ConnectionStatus.CONNECTED);
        sendHandShake();
    };
    socket.onclose = function() {
        // this.emit('connectionStatus', ConnectionStatus.DISCONNECTED);
        if (pingTimer !== null) {
            clearInterval(pingTimer);
        }
        if (checkSendMessageTimer !== null) {
            clearInterval(checkSendMessageTimer);
        }
        if (checkReceiveMessageTimer !== null) {
            clearInterval(checkReceiveMessageTimer);
        }
    };
    socket.onmessage = function(evt) {
        var message = this.messageUtil.decodeMessage(evt.data);
        receiveMessage(message);
    };
    socket.onerror = function(evt) {
        console.log('socket.onerror');
    };
    this.socket = socket;
    var self = this;

    // 接受消息
    function receiveMessage(message) {
        console.log('接收到消息');

        var packet = message;
        var protocol = packet.protocol;
        var content;
        var messageId = '-1';
        var messageUid = '-1';

        console.log('Packet protocol :' + protocol);
        if (protocol == 10) {
            console.log('接收到握手消息 10');
            content = packet.content;
            console.log('HandShake result: ' + content.result);
            if (!content.result) {
                console.log('HandShake result error: ' + content.error);
            } else {
                pingTimer = setInterval(sendRequestPing, 60000);
                setTimeout(checkSendMessageQuene, 2000);
                setTimeout(checkReceiveMessageQuene, 2000);
            }
        }

        if (protocol == 11) {
            console.log('心跳回应');
            lastReceivePongTime = new Date().getTime();
        }

        if (protocol == 40) {
            messageContent = packet.content;
            messageProtocol = messageContent.protocol;
            console.log('IMessage protocol :' + messageProtocol);
            if (messageProtocol == 2) {
                console.log('Received IM response \n 服务器回应:你发送的消息我收到了');
                content = messageContent.content;
                console.log('Received msgUid ' + content.msgUid);
                messageId = content.msgId.toString();
                messageUid = content.msgUid;
                if (self.sendMessageQuene[messageId]) {
                    self.sendMessageQuene[messageId].status = 1;
                    self.sendMessageQuene[messageId].messageUid = content.msgUid;
                }
            } else if (messageProtocol == 3) {
                content = messageContent.content;
                console.log('Received IM notify\n 服务器通知，A给你发消息了');
                console.log('messageContent' + messageContent.content);
                console.log('Received msgUid' + content.msgUid);
                messageId = content.msgId.toString();
                messageUid = content.msgUid;
                if (!self.receiveMessageQuene[messageId]) {
                    self.receiveMessageQuene[messageId] = {
                        msgId: messageId,
                        msgUid: messageUid,
                        timeStamp: new Date().getTime(),
                        count: 1,
                        status: 0
                    };
                }
                sendMessageNotifyAck(messageUid, messageId);
            } else if (messageProtocol == 5) {
                console.log('Received IM notifyAckAck\n 服务器通知B，我收到你的回应了');
                content = messageContent.content;
                console.log('Received msgUid' + content.msgUid);
                messageId = content.msgId.toString();
                if (self.receiveMessageQuene[messageId]) {
                    self.receiveMessageQuene[messageId].status = 4;
                }
            } else if (messageProtocol == 6) {
                console.log('Received IM requestAck\n 服务器通知A，B收到你的消息了');
                content = messageContent.content;
                console.log('Received msgUid' + content.msgUid);
                messageId = content.msgId.toString();
                if (self.sendMessageQuene[messageId]) {
                    self.sendMessageQuene[messageId].status += 2;
                }
            }
        }
    }

    // 发送握手请求
    function sendHandShake() {
        if (socket.readyState == WebSocket.OPEN) {
            var packet = self.messageUtil.buildHandShakeMessage();
            socket.send(self.messageUtil.encodeMessage(packet));
        }
    }

    // 发送心跳
    function sendRequestPing() {
        var packet = self.messageUtil.buildPingRequestMessage();
        var now = new Date().getTime();
        if (lastReceivePongTime !== 0 && now - lastReceivePongTime > 60000 * 2) {
            socket.refresh();
        } else {
            socket.send(self.messageUtil.encodeMessage(packet));
        }
    }

    //发送
    function sendMessageNotifyAck(msgUid, msgId) {
        console.log('sendMessageNotifyAck ' + msgUid + ' ' + msgId);
        var packet = self.messageUtil.buildMessageNotifyAck('targetId',msgUid, msgId);
        console.log('发送 IM notifyAck: ' + self.clientId + ' -> ' + self.toclientId);
        socket.send(self.messageUtil.encodeMessage(packet));
    }

    function checkSendMessageQuene() {
        var deleteKey = [];
        for (var key in self.sendMessageQuene) {
            // console.log('SendMessageQuene messageId:' + key);
            if (self.sendMessageQuene.hasOwnProperty(key)) {
                var now = new Date().getTime();
                var message = self.sendMessageQuene[key];
                var status = message.status;
                if (status === 0 || status === 2) {
                    if ((now - message.timeStamp) > message.count * 10000) {
                        if (message.count >= 4) {
                            deleteKey.push(key);
                            // console.log('消息发送失败：' + key);
                        } else {
                            message.count++;
                            message.status = 0;

                            console.log('重新发送 messageId: ' + key);
                            // socket.send(message.packet.toArrayBuffer());
                            socket.send(self.messageUtil.encodeMessage(message.packet));
                        }
                    }
                } else if (status === 1) {
                    if ((now - message.timeStamp) > message.count * 20000) {
                        if (message.count >= 4) {
                            deleteKey.push(key);
                            console.log('消息发送失败：' + key);
                        } else {
                            message.count++;
                            message.status = 0;

                            console.log('重新发送 messageId: ' + key);
                            // socket.send(message.packet.toArrayBuffer());
                            socket.send(self.messageUtil.encodeMessage(message.packet));
                        }
                    }
                } else if (status === 3) {
                    console.log('消息发送成功：' + key);
                    deleteKey.push(key);
                }
            }
        }
        for (var i = 0; i < deleteKey.length; i++) {
            var delKey = deleteKey[i];
            delete self.sendMessageQuene[delKey];
        }
        setTimeout(checkSendMessageQuene, 2000);
    }

    function checkReceiveMessageQuene() {
        var deleteKey = [];
        for (var key in self.receiveMessageQuene) {
            console.log('ReceiveMessageQuene messageUid:' + key);
            if (self.receiveMessageQuene.hasOwnProperty(key)) {
                var now = new Date().getTime();
                var message = self.receiveMessageQuene[key];
                var status = message.status;
                if (status === 0) {
                    if ((now - message.timeStamp) > message.count * 15000) {
                        if (message.count >= 4) {
                            deleteKey.push(key);
                            console.log('消息回应失败：' + key);
                        } else {
                            message.count++;
                            message.status = 0;
                            console.log('重新发送 messageUid: ' + key);
                            sendMessageNotifyAck(message.msgUid, parseInt(key));
                        }
                    }
                } else if (status === 4) {
                    console.log('消息回应成功：' + key);
                    deleteKey.push(key);
                }
            }
        }
        for (var i = 0; i < deleteKey.length; i++) {
            var delKey = deleteKey[i];
            delete self.receiveMessageQuene[delKey];
        }
        setTimeout(checkReceiveMessageQuene, 2000);
    }

};

util.inherits(SiLinWebSocket, EventEmitter);
MessageHandle.prototype.sendMessage = function (message){
    console.log('send ' + text);
    if (this.socket.readyState == WebSocket.OPEN) {
        var packet = this.messageUtil.buildTextMessage('targetId', message);
        this.sendMessageQuene[messageId.toString()] = {
            packet: packet,
            timeStamp: new Date().getTime(),
            status: 0,
            count: 1
        };
        console.log('发送 IM request: ' + this.clientId + ' -> ' + this.toclientId);
        this.socket.send(this.messageUtil.encodeMessage(packet));
    }
};


module.exports = MessageHandle;
