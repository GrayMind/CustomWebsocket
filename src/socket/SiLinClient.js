/* jslint esversion: 6 */

import ReconnectingWebSocket from "../lib/reconnectingWebSocket";
import MessageUtil from "../message/MessageUtil";
import util from "util";
import EventEmitter from "events";

import { PacketProtocol, NetworkStatus, IMMessageProtocol, SessionType, MessageType, OnlineStatus, MessageDirection, MessageSentStatus, ConnectionStatus } from "../enum/enmu";


function SiLinClient() {
    if (this instanceof SiLinWebSocket === false) {
      return new SiLinClient();
    }
    EventEmitter.call(this);

    this.messageUtil = new MessageUtil();
    this.messageUtil.init('clientId');

    var socket = new ReconnectingWebSocket(address, protocols, options);
    /*
        连接成功
        发送握手请求
        心跳开始计时
    */
    socket.onopen = function() {
        this.emit('connectionStatus', ConnectionStatus.CONNECTED);
    };
    socket.onclose = function() {
        this.emit('connectionStatus', ConnectionStatus.DISCONNECTED);
    };
    socket.onmessage = function(evt) {
        var message = this.messageUtil.decodeMessage(evt.data);

        this.emit('receive', evt.data);
    };
    socket.onerror = function(evt) {
        this.emit('error', evt);
    };

    this.socket = socket;
}

util.inherits(SiLinWebSocket, EventEmitter);

// 获取当前用户信息
SiLinClient.prototype.getUserInfo = function () {

};

// 连接
SiLinClient.prototype.connect = function () {

};

// // 监听连接状态改变
// SiLinClient.prototype.setConnectionStatusListener = function () {
//
// };
//
// // 监听消息接受
// SiLinClient.prototype.setOnReceiveMessageListener = function () {
//
// };

// 发送消息
SiLinClient.prototype.sendMessage = function () {

};

// 获取指定消息
SiLinClient.prototype.getMessage = function () {

};

// 获取历史消息
SiLinClient.prototype.getHistoryMessages = function () {

};

// 获取会话列表
SiLinClient.prototype.getSecessionList = function () {

};




medule.exports = SiLinClient;
