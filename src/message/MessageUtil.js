/* jslint esversion: 6 */

// import dcodeIO from "../lib/ProtoBuf.min";
// import { PacketProtocol, NetworkStatus, IMMessageProtocol, SessionType, MessageType, OnlineStatus, MessageDirection, MessageSentStatus, ConnectionStatus } from "../enum/enmu";

// var dcodeIO = require('../lib/ProtoBuf.min');
// var messageEnum = require('../enum/enum.js');

(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        global.MessageUtil = factory();
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


    if (typeof dcodeIO === 'undefined' || !dcodeIO.ProtoBuf) {
        throw (new Error("ProtoBuf.js is not present. Please see www/index.html for manual setup instructions."));
    }
    // Initialize ProtoBuf.js
    var ProtoBuf = dcodeIO.ProtoBuf;
    var Packet = ProtoBuf.loadProtoFile("/resource/packet.proto").build("Packet");
    //握手
    var HandShakeProto = ProtoBuf.loadProtoFile("/resource/handshake.proto");
    var HandShakeRequest = HandShakeProto.build("HandShakeRequest");
    var HandShakeResponse = HandShakeProto.build("HandShakeResponse");

    // 心跳
    var HeartbeatProto = ProtoBuf.loadProtoFile("/resource/heartbeat.proto");
    // 心跳回应
    var PingResponse = HeartbeatProto.build("PingResponse");
    // 心跳请求
    var PingRequest = HeartbeatProto.build("PingRequest");

    // IM 消息
    var MessageProto = ProtoBuf.loadProtoFile("/resource/message.proto");
    var IMessage = MessageProto.build("IMessage");

    // A发送消息给服务器 1 40
    var MessageRequest = MessageProto.build("MessageRequest");
    //服务器通知A，你发送的消息我收到了 2 41
    var MessageResponse = MessageProto.build("MessageResponse");
    //服务器通知B，A给你发消息了 3 42
    var MessageNotify = MessageProto.build("MessageNotify");
    //B通知服务器，我收到通知了 4 43
    var MessageNotifyAck = MessageProto.build("MessageNotifyAck");
    //服务器通知B，我收到你的回应了 5 44
    var MessageNotifyAckAck = MessageProto.build("MessageNotifyAckAck");
    //服务器通知A，B收到你的消息了 6 45
    var MessageRequestAck = MessageProto.build("MessageRequestAck");

    //客服online status
    var KeFuOnlineStatusRequest = MessageProto.build("KeFuOnlineStatusRequest");
    var KeFuOnlineStatusResponse = MessageProto.build("KeFuOnlineStatusResponse");
    var KickNotify = MessageProto.build("KickNotify");

    function MessageUtil(clientId) {
        this.clientId = clientId;
        this.version = 1;
    }

    // 生成文本消息 1
    MessageUtil.prototype.buildTextMessage = function (targetId, text) {
        if (this.clientId.length === 0) {
            console.log("请调用 MessageUtil.init(clientId) 进行初始化");
            return null;
        }

        var messageId = this.createMessageId();
        var msgReq = {
            msgId: messageId,
            sessionType: SessionType.CUSTOMER_SERVICE,
            from: this.clientId,
            to: targetId,
            contentType: MessageType.TEXT_MESSAGE,
            content: text
        };
        var iMessage = {
            version: this.version,
            fromClientId: this.clientId,
            toClientId: targetId,
            protocol: IMMessageProtocol.REQUEST,
            content: msgReq
        };
        var packet = {
            protocol: PacketProtocol.IM,
            security: 0,
            clientId: this.clientId,
            content: iMessage
        };

        return packet;
    };
    // 生成图片消息 1

    // 生成 4号消息
    MessageUtil.prototype.buildMessageNotifyAck = function (targetId, msgUid, msgId) {
        if (this.clientId.length === 0) {
            console.log("请调用 MessageUtil.init(clientId) 进行初始化");
            return null;
        }

        var messageNotifyAck = {
            msgUid: msgUid,
            msgId: msgId,
        };
        var iMessage = {
            version: this.version,
            fromClientId: this.clientId,
            toClientId: targetId,
            protocol: IMMessageProtocol.NOTIFYACK,
            content: messageNotifyAck
        };
        var packet = {
            protocol: PacketProtocol.IM,
            security: 0,
            clientId: this.clientId,
            content: iMessage
        };

        return packet;
    };

    // 生成握手消息
    MessageUtil.prototype.buildHandShakeMessage = function () {
        if (this.clientId.length === 0) {
            console.log("请调用 MessageUtil.init(clientId) 进行初始化");
            return null;
        }
        var handshake = {
            client_version: this.clientId,
            network: NetworkStatus.N_WIFI,
            secret_key: '12'
        };
        var packet = {
            protocol: PacketProtocol.HAND_SHAKE,
            security: 0,
            clientId: this.clientId,
            content: handshake
        };
        return packet;
    };

    // 生成客服online消息
    MessageUtil.prototype.buildOnlineStatusMessage = function (targetId, fromeUser, status) {
        if (this.clientId.length === 0) {
            console.log("请调用 MessageUtil.init(clientId) 进行初始化");
            return null;
        }

        var onlineStatusRequest = {
            fromeUser: fromeUser,
            status: status
        };

        var iMessage = {
            version: this.version,
            fromClientId: this.clientId,
            toClientId: targetId,
            protocol: IMMessageProtocol.ONLINE_STATUS_REQUEST,
            content: onlineStatusRequest
        };
        if(targetId.length === 0) {
            iMessage = {
                version: this.version,
                fromClientId: this.clientId,
                protocol: IMMessageProtocol.ONLINE_STATUS_REQUEST,
                content: onlineStatusRequest
            };
        }

        var packet = {
            protocol: PacketProtocol.IM,
            security: 0,
            clientId: this.clientId,
            content: iMessage
        };

        return packet;
    };

    // 生成心跳消息
    MessageUtil.prototype.buildPingRequestMessage = function () {
        if (this.clientId.length === 0) {
            console.log("请调用 MessageUtil.init(clientId) 进行初始化");
            return null;
        }
        var pingRequest = {
            ping: 'ping'
        };
        var packet = {
            protocol: PacketProtocol.HEART_BEAT,
            security: 0,
            clientId: this.clientId,
            content: pingRequest
        };
        return packet;
    };

    // 创建messageId
    MessageUtil.prototype.createMessageId = function () {
        var now = new Date().getTime();
        now = now.toString().substr(4) + Math.floor(Math.random() * (9999 - 1000) + 1000).toString();
        console.log('生成messageId ' + parseInt(now));
        return parseInt(now);
    };

    // 发送的 encode 一下
    MessageUtil.prototype.encodeMessage = function (message) {

        var packet = {};
        packet.protocol = message.protocol;
        packet.security = message.security;
        packet.clientId = message.clientId;

        var packetContent = message.content;
        if (message.protocol == PacketProtocol.IM) {
            var iMessage = {};
            iMessage.version = packetContent.version;
            iMessage.fromClientId = packetContent.fromClientId;
            iMessage.protocol = packetContent.protocol;

            if (packetContent.toClientId && packetContent.toClientId.length !== 0) {
                iMessage.toClientId = packetContent.toClientId;
            }
            
            var messageContent = packetContent.content;

            if (packetContent.protocol ==  IMMessageProtocol.REQUEST) {
                var messageReq = {};
                messageReq.msgId = messageContent.msgId;
                messageReq.sessionType = messageContent.sessionType;
                messageReq.from = messageContent.from;
                messageReq.to = messageContent.to;
                messageReq.contentType = messageContent.contentType;
                messageReq.content = messageContent.content;

                iMessage.content = new MessageRequest(messageReq).encode().toArrayBuffer();

                packet.content = new IMessage(iMessage).encode().toArrayBuffer();

            } else if (packetContent.protocol ==  IMMessageProtocol.RESPONSE) {

                var messageRes = {};
                messageRes.msgId = messageContent.msgId;
                messageRes.msgUid = messageContent.msgUid;
                messageRes.ts = messageContent.ts;

                iMessage.content = new MessageResponse(messageRes).encode().toArrayBuffer();

                packet.content = new IMessage(iMessage).encode().toArrayBuffer();

            } else if (packetContent.protocol ==  IMMessageProtocol.NOTIFY) {

                var messageNotify = {};
                messageNotify.msgId = messageContent.msgId;
                messageNotify.msgUid = messageContent.msgUid;
                messageNotify.sessionType = messageContent.sessionType;
                messageNotify.from = messageContent.from;
                messageNotify.contentType = messageContent.contentType;
                messageNotify.content = messageContent.content;
                messageNotify.ts = messageContent.ts;

                iMessage.content = new MessageNotify(messageNotify).encode().toArrayBuffer();

                packet.content = new IMessage(iMessage).encode().toArrayBuffer();

            } else if (packetContent.protocol ==  IMMessageProtocol.NOTIFYACK) {
                var messageNotifyAck = {};
                messageNotifyAck.msgId = messageContent.msgId;
                messageNotifyAck.msgUid = messageContent.msgUid;

                iMessage.content = new MessageNotifyAck(messageNotifyAck).encode().toArrayBuffer();

                packet.content = new IMessage(iMessage).encode().toArrayBuffer();

            } else if (packetContent.protocol ==  IMMessageProtocol.NOTIFYACKACK) {
                var messageNotifyAckAck = {};
                messageNotifyAckAck.msgId = messageContent.msgId;
                messageNotifyAckAck.msgUid = messageContent.msgUid;

                iMessage.content = new MessageNotifyAckAck(messageNotifyAckAck).encode().toArrayBuffer();

                packet.content = new IMessage(iMessage).encode().toArrayBuffer();

            } else if (packetContent.protocol ==  IMMessageProtocol.REQUESTACK) {
                var messageReqAck = {};
                messageReqAck.msgId = messageContent.msgId;
                messageReqAck.msgUid = messageContent.msgUid;

                iMessage.content = new MessageRequestAck(messageReqAck).encode().toArrayBuffer();

                packet.content = new IMessage(iMessage).encode().toArrayBuffer();

            } else if (packetContent.protocol ==  IMMessageProtocol.ONLINE_STATUS_REQUEST) {
                var onlineReq = {};
                onlineReq.fromeUser = messageContent.fromeUser;
                onlineReq.status = messageContent.status;

                iMessage.content = new KeFuOnlineStatusRequest(onlineReq).encode().toArrayBuffer();

                packet.content = new IMessage(iMessage).encode().toArrayBuffer();

            } else if (packetContent.protocol ==  IMMessageProtocol.ONLINE_STATUS_RESPONSE) {
                var onlineRes = {};
                onlineRes.respCode = messageContent.respCode;
                onlineRes.status = messageContent.status;

                iMessage.content = new KeFuOnlineStatusResponse(onlineRes).encode().toArrayBuffer();

                packet.content = new IMessage(iMessage).encode().toArrayBuffer();

            }
        }
        else if (message.protocol ==  PacketProtocol.HAND_SHAKE) {
            var handshake = new HandShakeRequest({
                client_version: '1',
                network: 2,
                secret_key: '12'
            });
            packet.content = handshake.encode().toArrayBuffer();
        }
        else if (message.protocol ==  PacketProtocol.HEART_BEAT) {
            var pingRequest = new PingRequest({
                ping: 'ping'
            });
            packet.content = pingRequest.encode().toArrayBuffer();
        }

        return new Packet(packet).toArrayBuffer();
    };

    // 接收的 decode 一下
    MessageUtil.prototype.decodeMessage = function (messageData) {
        var packet = Packet.decode(messageData);
        var protocol = packet.protocol;
        var content;

        if (protocol ==  PacketProtocol.IM) {
            var messageContent = IMessage.decode(packet.content);
            var messageProtocol = messageContent.protocol;

            if (messageProtocol ==  IMMessageProtocol.RESPONSE) {
                content = MessageResponse.decode(messageContent.content);
                messageContent.content = content;

            }
            else if (messageProtocol ==  IMMessageProtocol.NOTIFY) {
                content = MessageNotify.decode(messageContent.content);
                messageContent.content = content;

            }
            else if (messageProtocol ==  IMMessageProtocol.NOTIFYACKACK) {
                content = MessageNotifyAckAck.decode(messageContent.content);
                messageContent.content = content;
            }
            else if (messageProtocol ==  IMMessageProtocol.REQUESTACK) {
                content = MessageRequestAck.decode(messageContent.content);
                messageContent.content = content;
            }
            else if (messageProtocol ==  IMMessageProtocol.ONLINE_STATUS_RESPONSE) {
                content = MessageResponse.decode(messageContent.content);
                messageContent.content = content;
            }
            packet.content = messageContent;
        }
        else if (protocol ==  PacketProtocol.HAND_SHAKE) {
            content = HandShakeResponse.decode(packet.content);
            packet.content = content;
        }
        else if (protocol ==  PacketProtocol.HEART_BEAT) {
            content = PingResponse.decode(packet.content);
            packet.content = content;
        }
        return packet;
    };
    return MessageUtil;
});
