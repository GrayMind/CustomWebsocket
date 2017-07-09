/* jslint esversion: 6 */
// var util = require('util');
// var EventEmitter = require('events');
// var MessageUtil = require('../message/MessageUtil.js');
// var ReconnectingWebSocket = require('../lib/reconnectingWebSocket.js');
// var DataProvider = require('../localStorage/dataProvider.js');
// import EventEmitter from "events";
// import MessageUtil from "../message/MessageUtil";
// import ReconnectingWebSocket from "../lib/reconnectingWebSocket";
// import DataProvider from '../localStorage/dataProvider';

(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        global.MessageHandle = factory();
    }
})(this, function() {

    var messageEnum = new MessageEnum();
    var PacketProtocol = messageEnum.PacketProtocol,
        NetworkStatus = messageEnum.NetworkStatus,
        IMMessageProtocol = messageEnum.IMMessageProtocol,
        SessionType = messageEnum.SessionType,
        MessageType = messageEnum.MessageType,
        OnlineStatus = messageEnum.OnlineStatus,
        MessageDirection = messageEnum.MessageDirection,
        MessageSentStatus = messageEnum.MessageSentStatus,
        ConnectionStatus = messageEnum.ConnectionStatus;

    var MessageHandle = function(address ,clientId, token) {
        // EventEmitter.call(this);
        this.eventObject = jQuery({});

        this.messageUtil = new MessageUtil(clientId);
        this.userToken = token;
        this.clientId = clientId;
        this.receiveMessageQuene = {};
        this.sendMessageQuene = {};

        this.messageResponseTimeout = 2;

        this.pingTimer = null;
        this.checkSendMessageTimer = null;
        this.checkReceiveMessageTimer = null;
        this.lastReceivePongTime = 0;

        var self = this;
        var socket = new ReconnectingWebSocket(address, null, {
            debug: true,
            reconnectInterval: 3000,
            binaryType: "arraybuffer",
            maxReconnectAttempts: 3
        });
        socket.onopen = function() {
            console.log('socket.onopen');
            self.eventObject.trigger('connectionStatus', [ConnectionStatus.CONNECTED]);
            self._sendHandShake();
        };
        socket.onclose = function() {
            console.log('socket.onclose');
            self.eventObject.trigger('connectionStatus', [ConnectionStatus.DISCONNECTED]);
            if (self.pingTimer !== null) {
                clearInterval(self.pingTimer);
            }
            if (self.checkSendMessageTimer !== null) {
                clearInterval(self.checkSendMessageTimer);
            }
            if (self.checkReceiveMessageTimer !== null) {
                clearInterval(self.checkReceiveMessageTimer);
            }
        };
        socket.onmessage = function(evt) {
            console.log('socket.onmessage');
            var message = self.messageUtil.decodeMessage(evt.data);
            self._receiveMessage(message);
        };
        socket.onerror = function(evt) {
            console.log('socket.onerror');
        };
        this.socket = socket;

    };

    MessageHandle.prototype.on = function (type, fn) {
        this.eventObject.bind(type, fn);
    };
    // util.inherits(SiLinWebSocket, EventEmitter);

    MessageHandle.prototype.onlineChange = function (status) {
        console.log('onlineChange');
        var packet = this.messageUtil.buildOnlineStatusMessage('', this.userToken, status);
        console.log(packet);
        console.log('发送 在线状态 request: ');
        this.socket.send(this.messageUtil.encodeMessage(packet));
    };

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

    // 接受消息
    MessageHandle.prototype._receiveMessage = function (message) {
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
                this._sendRequestPing();
                this.onlineChange(this.userToken ,OnlineStatus.ONLINE);
                this.pingTimer = setInterval(this._sendRequestPing.bind(this), 30000);
                setTimeout(this._checkSendMessageQuene, 2000);
                setTimeout(this._checkReceiveMessageQuene, 2000);
            }
        }

        if (protocol == 11) {
            console.log('心跳回应');
            this.lastReceivePongTime = new Date().getTime();
        }

        var messageContent;
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
                if (this.sendMessageQuene[messageId]) {
                    this.sendMessageQuene[messageId].status = 1;
                    this.sendMessageQuene[messageId].messageUid = content.msgUid;
                }
            } else if (messageProtocol == 3) {
                content = messageContent.content;
                console.log('Received IM notify\n 服务器通知，A给你发消息了');
                console.log('messageContent' + messageContent.content);
                console.log('Received msgUid' + content.msgUid);
                messageId = content.msgId.toString();
                messageUid = content.msgUid;
                if (!this.receiveMessageQuene[messageId]) {
                    this.receiveMessageQuene[messageId] = {
                        msgId: messageId,
                        msgUid: messageUid,
                        timeStamp: new Date().getTime(),
                        count: 1,
                        status: 0
                    };
                }
                this._sendMessageNotifyAck(messageUid, messageId);

                this.eventObject.trigger('receive', [packet]);

            } else if (messageProtocol == 5) {
                console.log('Received IM notifyAckAck\n 服务器通知B，我收到你的回应了');
                content = messageContent.content;
                console.log('Received msgUid' + content.msgUid);
                messageId = content.msgId.toString();
                if (this.receiveMessageQuene[messageId]) {
                    this.receiveMessageQuene[messageId].status = 4;
                }
            } else if (messageProtocol == 6) {
                console.log('Received IM requestAck\n 服务器通知A，B收到你的消息了');
                content = messageContent.content;
                console.log('Received msgUid' + content.msgUid);
                messageId = content.msgId.toString();
                if (this.sendMessageQuene[messageId]) {
                    this.sendMessageQuene[messageId].status += 2;
                }
            }
        }
    };

    // 发送握手请求
    MessageHandle.prototype._sendHandShake = function() {
        if (this.socket.readyState == WebSocket.OPEN) {
            console.log('_sendHandShake');
            var packet = this.messageUtil.buildHandShakeMessage();
            console.log(packet);
            this.socket.send(this.messageUtil.encodeMessage(packet));
        }
    };

    // 发送心跳
    MessageHandle.prototype._sendRequestPing = function() {
        console.log('_sendRequestPing');
        console.log('this.messageUtil');
        console.log(this);
        console.log(this.messageUtil);
        console.log(this.lastReceivePongTime);
        var packet = this.messageUtil.buildPingRequestMessage();
        console.log(packet);
        var now = new Date().getTime();
        if (this.lastReceivePongTime !== 0 && now - this.lastReceivePongTime > 30000 * 2) {
            this.eventObject.trigger('connectionStatus', [ConnectionStatus.CONNECTING]);
            this.socket.refresh();
        } else {
            this.socket.send(this.messageUtil.encodeMessage(packet));
        }
    };

    //发送
    MessageHandle.prototype._sendMessageNotifyAck = function(msgUid, msgId) {
        console.log('sendMessageNotifyAck ' + msgUid + ' ' + msgId);
        var packet = this.messageUtil.buildMessageNotifyAck('targetId',msgUid, msgId);
        console.log('发送 IM notifyAck: ' + self.clientId + ' -> ' + self.toclientId);
        this.socket.send(this.messageUtil.encodeMessage(packet));
    };

    MessageHandle.prototype._checkSendMessageQuene = function() {
        var deleteKey = [];
        for (var key in this.sendMessageQuene) {
            // console.log('SendMessageQuene messageId:' + key);
            if (this.sendMessageQuene.hasOwnProperty(key)) {
                var now = new Date().getTime();
                var message = this.sendMessageQuene[key];
                var status = message.status;
                if (status === 0 || status === 2) {
                    if ((now - message.timeStamp) > message.count * 10000) {
                        if (message.count >= 4) {
                            deleteKey.push(key);
                            // console.log('消息发送失败：' + key);
                            this.eventObject.trigger('sendFail', [message.packet]);
                        } else {
                            message.count++;
                            message.status = 0;

                            console.log('重新发送 messageId: ' + key);
                            // socket.send(message.packet.toArrayBuffer());
                            this.socket.send(self.messageUtil.encodeMessage(message.packet));
                        }
                    }
                } else if (status === 1) {
                    if ((now - message.timeStamp) > message.count * 20000) {
                        if (message.count >= 4) {
                            deleteKey.push(key);
                            console.log('消息发送失败：' + key);
                            this.eventObject.trigger('sendFail', [message.packet]);
                        } else {
                            message.count++;
                            message.status = 0;

                            console.log('重新发送 messageId: ' + key);
                            // socket.send(message.packet.toArrayBuffer());
                            this.socket.send(self.messageUtil.encodeMessage(message.packet));
                        }
                    }
                } else if (status === 3) {
                    console.log('消息发送成功：' + key);
                    this.eventObject.trigger('sendSuccess', [message.packet]);
                    deleteKey.push(key);
                }
            }
        }
        for (var i = 0; i < deleteKey.length; i++) {
            var delKey = deleteKey[i];
            delete this.sendMessageQuene[delKey];
        }
        setTimeout(this._checkSendMessageQuene, 2000);
    };

    MessageHandle.prototype._checkReceiveMessageQuene = function() {
        var deleteKey = [];
        for (var key in this.receiveMessageQuene) {
            console.log('ReceiveMessageQuene messageUid:' + key);
            if (this.receiveMessageQuene.hasOwnProperty(key)) {
                var now = new Date().getTime();
                var message = this.receiveMessageQuene[key];
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
                            this._sendMessageNotifyAck(message.msgUid, parseInt(key));
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
            delete this.receiveMessageQuene[delKey];
        }
        setTimeout(this._checkReceiveMessageQuene, 2000);
    };



    return MessageHandle;
});



// module.exports = MessageHandle;
