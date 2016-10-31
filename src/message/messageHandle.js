/* jslint esversion: 6 */
import util from "util";
import EventEmitter from "events";
import MessageUtil from "../message/MessageUtil";


var MessageHandle = function (clientId) {
    EventEmitter.call(this);

    this.messageUtil = new MessageUtil(clientId);

    this.clientId = clientId;
    this.receiveMessageQuene = {};
    this.sendMessageQuene = {};

};

util.inherits(SiLinWebSocket, EventEmitter);

MessageHandle.prototype.addSendMessage = function (message) {
    this.sendMessageQuene[message.messageId.toString()] = {
        packet: message,
        timeStamp: new Date().getTime(),
        status: 0,
        count: 1
    };
};

MessageHandle.prototype.addReceiveMessage = function (message) {

    var packet = this.messageUtil.decodeMessage(message);
    console.log(packet);

    var protocol = packet.protocol;
    var content;
    var messageId = '-1';
    var messageUid = '-1';

    if (protocol == 10) {
        console.log('接收到握手消息 10');
        content = packet.content;
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
        messageContent = IMessage.decode(packet.content);
        messageProtocol = messageContent.protocol;
        console.log('IMessage protocol :' + messageProtocol);
        if (messageProtocol == 2) {
            console.log('Received IM response \n 服务器回应:你发送的消息我收到了');
            content = MessageResponse.decode(messageContent.content);
            console.log('Received msgUid ' + content.msgUid);
            messageId = content.msgId.toString();
            messageUid = content.msgUid;
            if (self.sendMessageQuene[messageId]) {
                self.sendMessageQuene[messageId].status = 1;
                self.sendMessageQuene[messageId].messageUid = content.msgUid;
            }
        } else if (messageProtocol == 3) {
            console.log('Received IM notify\n 服务器通知，A给你发消息了');
            console.log('messageContent' + messageContent.content);
            content = MessageNotify.decode(messageContent.content);
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
            content = MessageNotifyAckAck.decode(messageContent.content);
            console.log('Received msgUid' + content.msgUid);
            messageId = content.msgId.toString();
            if (self.receiveMessageQuene[messageId]) {
                self.receiveMessageQuene[messageId].status = 4;
            }
        } else if (messageProtocol == 6) {
            console.log('Received IM requestAck\n 服务器通知A，B收到你的消息了');
            content = MessageRequestAck.decode(messageContent.content);
            console.log('Received msgUid' + content.msgUid);
            messageId = content.msgId.toString();
            if (self.sendMessageQuene[messageId]) {
                self.sendMessageQuene[messageId].status += 2;
            }
        }
    }
};

module.exports = MessageHandle;
