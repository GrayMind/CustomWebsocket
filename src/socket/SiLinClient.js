/* jslint esversion: 6 */

// import MessageUtil from "../message/MessageUtil";
// import MessageHandle from "../message/MessageHandle";
// import util from "util";
// import EventEmitter from "events";

// import { PacketProtocol, NetworkStatus, IMMessageProtocol, SessionType, MessageType, OnlineStatus, MessageDirection, MessageSentStatus, ConnectionStatus } from "../enum/enmu";

// var util = require('util');
// var EventEmitter = require('events');
// var MessageUtil = require('../message/MessageUtil.js');
// var MessageHandle = require('../message/MessageHandle.js');

// var messageEnum = require('../enum/enum.js');


(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        global.SiLinClient = factory();
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

    function SiLinClient(address, clientId ,token) {
        // if (this instanceof SiLinClient === false) {
        //   return new SiLinClient();
        // }
        // EventEmitter.call(this);
        this.eventObject = jQuery({});
        // this.messageUtil = new MessageUtil('clientId');
        this.messageHandle = new MessageHandle(address, clientId, token);
    }

    // util.inherits(SiLinWebSocket, EventEmitter);

    // 获取当前用户信息
    SiLinClient.prototype.getUserInfo = function () {

    };

    // 连接
    SiLinClient.prototype.connect = function () {

    };

    // 监听连接状态改变
    SiLinClient.prototype.setConnectionStatusListener = function (listener) {
        this.messageHandle.on('connectionStatus', function(status) {
            console.log('connectionStatus ' + status);
            listener.onChanged(status);
        });
    };

    // 监听消息接受
    SiLinClient.prototype.setOnReceiveMessageListener = function (listener) {
        this.messageHandle.on('receive', function(message) {
            console.log('receive ' + message);
            listener.onReceive(message);
        });
    };

    // 发送消息
    SiLinClient.prototype.sendMessage = function (message, callback) {
        this.messageHandle.sendMessage();
        this.messageHandle.on('sendFail', function(message) {
            callback.onError(message);
        });
        this.messageHandle.on('sendSuccess', function(message) {
            callback.onSuccess(message);
        });
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

    SiLinClient.prototype.on = function (type, fn) {
        this.eventObject.bind(type, fn);
    };

    return SiLinClient;
});



// medule.exports = SiLinClient;
