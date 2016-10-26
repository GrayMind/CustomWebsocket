/* jslint esversion: 6 */

// var dcodeIO = require("../lib/ProtoBuf.min");
import dcodeIO from "../lib/ProtoBuf.min";
// var MessageEnum = require("../enum/enmu");
import * as  MessageEnum from "../enum/enmu";

// Initialize ProtoBuf.js
var ProtoBuf = dcodeIO.ProtoBuf;

var Packet = ProtoBuf.loadProtoFile("./packet.proto").build("Packet");
//握手
var HandShakeProto = ProtoBuf.loadProtoFile("./handshake.proto");
var HandShakeRequest = HandShakeProto.build("HandShakeRequest");
var HandShakeResponse = HandShakeProto.build("HandShakeResponse");

// 心跳
var HeartbeatProto = ProtoBuf.loadProtoFile("./heartbeat.proto");
// 心跳回应
var PingResponse = HeartbeatProto.build("PingResponse");
// 心跳请求
var PingRequest = HeartbeatProto.build("PingRequest");

// IM 消息
var MessageProto = ProtoBuf.loadProtoFile("./message.proto");
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

function MessageUtil() {}

// 发送的 encode 一下
MessageUtil.prototype.encodeMessage = function (message) {

    var packet = {};
    packet.protocol = message.protocol;
    packet.security = message.security;
    packet.clientId = message.clientId;

    var packetContent = message.content;
    if (message.protocol == MessageEnum.PacketProtocol.IM) {
        var iMessage = {};
        iMessage.version = packetContent.version;
        iMessage.fromClientId = packetContent.fromClientId;
        iMessage.toClientId = packetContent.toClientId;
        iMessage.protocol = packetContent.protocol;

        var messageContent = packetContent.content;

        if (packetContent.protocol == MessageEnum.IMMessageProtocol.REQUEST) {
            var messageReq = {};
            messageReq.msgId = messageContent.msgId;
            messageReq.sessionType = messageContent.sessionType;
            messageReq.from = messageContent.from;
            messageReq.to = messageContent.to;
            messageReq.contentType = messageContent.contentType;
            messageReq.content = messageContent.content;

            iMessage.content = new MessageRequest(messageReq).encode().toArrayBuffer();

            packet.content = new IMessage(iMessage).encode().toArrayBuffer();

        } else if (packetContent.protocol == MessageEnum.IMMessageProtocol.RESPONSE) {

            var messageRes = {};
            messageRes.msgId = messageContent.msgId;
            messageRes.msgUid = messageContent.msgUid;
            messageRes.ts = messageContent.ts;

            iMessage.content = new MessageResponse(messageRes).encode().toArrayBuffer();

            packet.content = new IMessage(iMessage).encode().toArrayBuffer();

        } else if (packetContent.protocol == MessageEnum.IMMessageProtocol.NOTIFY) {

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

        } else if (packetContent.protocol == MessageEnum.IMMessageProtocol.NOTIFYACK) {
            var messageNotifyAck = {};
            messageNotifyAck.msgId = messageContent.msgId;
            messageNotifyAck.msgUid = messageContent.msgUid;

            iMessage.content = new MessageNotifyAck(messageNotifyAck).encode().toArrayBuffer();

            packet.content = new IMessage(iMessage).encode().toArrayBuffer();

        } else if (packetContent.protocol == MessageEnum.IMMessageProtocol.NOTIFYACKACK) {
            var messageNotifyAckAck = {};
            messageNotifyAckAck.msgId = messageContent.msgId;
            messageNotifyAckAck.msgUid = messageContent.msgUid;

            iMessage.content = new MessageNotifyAckAck(messageNotifyAckAck).encode().toArrayBuffer();

            packet.content = new IMessage(iMessage).encode().toArrayBuffer();

        } else if (packetContent.protocol == MessageEnum.IMMessageProtocol.REQUESTACK) {
            var messageReqAck = {};
            messageReqAck.msgId = messageContent.msgId;
            messageReqAck.msgUid = messageContent.msgUid;

            iMessage.content = new MessageRequestAck(messageReqAck).encode().toArrayBuffer();

            packet.content = new IMessage(iMessage).encode().toArrayBuffer();

        } else if (packetContent.protocol == MessageEnum.IMMessageProtocol.ONLINE_STATUS_REQUEST) {
            var onlineReq = {};
            onlineReq.fromeUser = onlineReq.fromeUser;
            onlineReq.status = onlineReq.status;

            iMessage.content = new KeFuOnlineStatusRequest(onlineReq).encode().toArrayBuffer();

            packet.content = new IMessage(iMessage).encode().toArrayBuffer();

        } else if (packetContent.protocol == MessageEnum.IMMessageProtocol.ONLINE_STATUS_RESPONSE) {
            var onlineRes = {};
            onlineRes.respCode = onlineRes.respCode;
            onlineRes.status = onlineRes.status;

            iMessage.content = new KeFuOnlineStatusResponse(onlineRes).encode().toArrayBuffer();

            packet.content = new IMessage(iMessage).encode().toArrayBuffer();

        }
    }
    else if (message.protocol == MessageEnum.PacketProtocol.HAND_SHAKE) {
        var handshake = new HandShakeRequest({
            client_version: '1',
            network: 2,
            secret_key: '12'
        });
        packet.content = handshake.encode().toArrayBuffer();
    }
    else if (message.protocol == MessageEnum.PacketProtocol.HEART_BEAT) {
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

    if (protocol == MessageEnum.PacketProtocol.IM) {
        var messageContent = IMessage.decode(packet.content);
        var messageProtocol = messageContent.protocol;

        if (messageProtocol == MessageEnum.IMMessageProtocol.RESPONSE) {
            content = MessageResponse.decode(messageContent.content);
            messageContent.content = content;

        }
        else if (messageProtocol == MessageEnum.IMMessageProtocol.NOTIFY) {
            content = MessageNotify.decode(messageContent.content);
            messageContent.content = content;

        }
        else if (messageProtocol == MessageEnum.IMMessageProtocol.NOTIFYACKACK) {
            content = MessageNotifyAckAck.decode(messageContent.content);
            messageContent.content = content;
        }
        else if (messageProtocol == MessageEnum.IMMessageProtocol.REQUESTACK) {
            content = MessageRequestAck.decode(messageContent.content);
            messageContent.content = content;
        }
        else if (messageProtocol == MessageEnum.IMMessageProtocol.ONLINE_STATUS_RESPONSE) {
            content = MessageResponse.decode(messageContent.content);
            messageContent.content = content;
        }
        packet.content = messageContent;
    }
    else if (protocol == MessageEnum.PacketProtocol.HAND_SHAKE) {
        content = HandShakeResponse.decode(packet.content);
        packet.content = content;
    }
    else if (protocol == MessageEnum.PacketProtocol.HEART_BEAT) {
        content= HeartbeatProto .decode(packet.content);
        packet.content = content;
    }

    return packet;
};

medule.exports = MessageUtil;
