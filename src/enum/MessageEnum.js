/* jslint esversion: 6 */



(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        global.MessageEnum = factory();
    }
})(this, function() {

    function MessageEnum() {

        //协议类型(10 握手 11 心跳 40 IM)
        var PacketProtocol = {
            /**
             * 握手
             */
            HAND_SHAKE: 10,
            /**
             * 心跳
             */
            HEART_BEAT: 11,
            /**
             * IM
             */
            IM: 40
        };
        this.PacketProtocol = PacketProtocol;

        var NetworkStatus = {
            /**
             * 无法识别网络
             */
            N_ERR: 1,
            /**
             * WIFI网络
             */
            N_WIFI: 2,
            /**
             * 2G网
             */
            N_2G: 3,
            /**
             * 3G网
             */
            N_3G: 4,
            /**
             * 4G网
             */
            N_4G: 5,
        };
        this.NetworkStatus = NetworkStatus;

        var IMMessageProtocol = {
            /**
             * A发送消息给服务器。
             */
            REQUEST: 1,
            /**
             * 服务器返回消息给A。
             */
            RESPONSE: 2,
            /**
             * 服务器通知B。
             */
            NOTIFY: 3,
            /**
             * B通知服务器，收到消息。
             */
            NOTIFYACK: 4,
            /**
             * 服务器通知B，收到回复。
             */
            NOTIFYACKACK: 5,
            /**
             * 服务器通知A，B收到消息。
             */
            REQUESTACK: 6,

            /**
             * 客服online status REQUEST
             */
            ONLINE_STATUS_REQUEST: 20,
            /**
             * 客服online status RESPONSE
             */
            ONLINE_STATUS_RESPONSE: 21,
        };
        this.IMMessageProtocol = IMMessageProtocol;

        var SessionType = {
            /**
             * 客服。
             */
            CUSTOMER_SERVICE: 12,
            /**
             * 群聊。
             */
            GROUP: 11,
            /**
             * 单聊。
             */
            PRIVATE: 10
        };
        this.SessionType = SessionType;

        // 10 文字 11图片 12 图文 13 语音 14 视频 15 位置
        var MessageType = {
            TEXT_MESSAGE: 10,
            IMAGE_MESSAGE: 11,
            RICHCONTETN_MESSAGE: 12,
            VOICE_MESSAGE: 13,
            VIDEO_MESSAGE: 14,
            LOCATION_MESSAGE: 15
        };
        this.MessageType = MessageType;

        //1.online,2.away,3.offline
        var OnlineStatus = {
            ONLINE : '1',
            AWAY: '2',
            OFFLINE: '3'
        };
        this.OnlineStatus = OnlineStatus;

        var MessageDirection = {
            /**
             * 发送消息。
             */
            SEND: 1,
            /**
             * 接收消息。
             */
            RECEIVE: 2
        };
        this.MessageDirection = MessageDirection;

        var MessageSentStatus = {
            /**
             * 发送中。
             */
            SENDING: 10,

            /**
             * 发送失败。
             */
            FAILED: 20,

            /**
             * 已发送。
             */
            SENT: 30,

            /**
             * 对方已接收。
             */
            RECEIVED: 40,

            /**
             * 对方已读。
             */
            READ: 50,

            /**
             * 对方已销毁。
             */
            DESTROYED: 60
        };
        this.MessageSentStatus = MessageSentStatus;

        var ConnectionStatus = {
            /**
             * 连接成功。
             */
            CONNECTED : 0,

            /**
             * 连接中。
             */
            CONNECTING : 1,

            /**
             * 断开连接。
             */
            DISCONNECTED : 2,

            /**
             * 用户账户在其他设备登录，本机会被踢掉线。
             */
            KICKED_OFFLINE_BY_OTHER_CLIENT : 6,

            /**
             * 网络不可用。
             */
            NETWORK_UNAVAILABLE : 3,

            /**
             * 域名错误
             */
            DOMAIN_INCORRECT : 12,
            /**
            *  连接关闭。
            */
            CONNECTION_CLOSED : 4
        };
        this.ConnectionStatus = ConnectionStatus;

    }
    return MessageEnum;
});

// //协议类型(10 握手 11 心跳 40 IM)
// var PacketProtocol = {
//     /**
//      * 握手
//      */
//     HAND_SHAKE: 10,
//     /**
//      * 心跳
//      */
//     HEART_BEAT: 11,
//     /**
//      * IM
//      */
//     IM: 40
// };
// exports.PacketProtocol = PacketProtocol;
//
// var NetworkStatus = {
//     /**
//      * 无法识别网络
//      */
//     N_ERR: 1,
//     /**
//      * WIFI网络
//      */
//     N_WIFI: 2,
//     /**
//      * 2G网
//      */
//     N_2G: 3,
//     /**
//      * 3G网
//      */
//     N_3G: 4,
//     /**
//      * 4G网
//      */
//     N_4G: 5,
// };
// exports.NetworkStatus = NetworkStatus;
//
// var IMMessageProtocol = {
//     /**
//      * A发送消息给服务器。
//      */
//     REQUEST: 1,
//     /**
//      * 服务器返回消息给A。
//      */
//     RESPONSE: 2,
//     /**
//      * 服务器通知B。
//      */
//     NOTIFY: 3,
//     /**
//      * B通知服务器，收到消息。
//      */
//     NOTIFYACK: 4,
//     /**
//      * 服务器通知B，收到回复。
//      */
//     NOTIFYACKACK: 5,
//     /**
//      * 服务器通知A，B收到消息。
//      */
//     REQUESTACK: 6,
//
//     /**
//      * 客服online status REQUEST
//      */
//     ONLINE_STATUS_REQUEST: 20,
//     /**
//      * 客服online status RESPONSE
//      */
//     ONLINE_STATUS_RESPONSE: 21,
// };
// exports.IMMessageProtocol = IMMessageProtocol;
//
// var SessionType = {
//     /**
//      * 客服。
//      */
//     CUSTOMER_SERVICE: 12,
//     /**
//      * 群聊。
//      */
//     GROUP: 11,
//     /**
//      * 单聊。
//      */
//     PRIVATE: 10
// };
// exports.SessionType = SessionType;
//
// // 10 文字 11图片 12 图文 13 语音 14 视频 15 位置
// var MessageType = {
//     TEXT_MESSAGE: 10,
//     IMAGE_MESSAGE: 11,
//     RICHCONTETN_MESSAGE: 12,
//     VOICE_MESSAGE: 13,
//     VIDEO_MESSAGE: 14,
//     LOCATION_MESSAGE: 15
// };
// exports.MessageType = MessageType;
//
// //1.online,2.away,3.offline
// var OnlineStatus = {
//     ONLINE : 1,
//     AWAY: 2,
//     OFFLINE: 3
// };
// exports.OnlineStatus = OnlineStatus;
//
// var MessageDirection = {
//     /**
//      * 发送消息。
//      */
//     SEND: 1,
//     /**
//      * 接收消息。
//      */
//     RECEIVE: 2
// };
// exports.MessageDirection = MessageDirection;
//
// var MessageSentStatus = {
//     /**
//      * 发送中。
//      */
//     SENDING: 10,
//
//     /**
//      * 发送失败。
//      */
//     FAILED: 20,
//
//     /**
//      * 已发送。
//      */
//     SENT: 30,
//
//     /**
//      * 对方已接收。
//      */
//     RECEIVED: 40,
//
//     /**
//      * 对方已读。
//      */
//     READ: 50,
//
//     /**
//      * 对方已销毁。
//      */
//     DESTROYED: 60
// };
// exports.MessageSentStatus = MessageSentStatus;
//
// var ConnectionStatus = {
//     /**
//      * 连接成功。
//      */
//     CONNECTED : 0,
//
//     /**
//      * 连接中。
//      */
//     CONNECTING : 1,
//
//     /**
//      * 断开连接。
//      */
//     DISCONNECTED : 2,
//
//     /**
//      * 用户账户在其他设备登录，本机会被踢掉线。
//      */
//     KICKED_OFFLINE_BY_OTHER_CLIENT : 6,
//
//     /**
//      * 网络不可用。
//      */
//     NETWORK_UNAVAILABLE : 3,
//
//     /**
//      * 域名错误
//      */
//     DOMAIN_INCORRECT : 12,
//     /**
//     *  连接关闭。
//     */
//     CONNECTION_CLOSED : 4
// };
// exports.ConnectionStatus = ConnectionStatus;
