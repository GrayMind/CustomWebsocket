/* jslint esversion: 6 */

import ReconnectingWebSocket from "../lib/reconnectingWebSocket";
import util from "util";
import EventEmitter from "events";

function SiLinWebSocket (address, protocols, options) {
    if (this instanceof SiLinWebSocket === false) {
      return new SiLinWebSocket(address, protocols, options);
    }
    EventEmitter.call(this);

    var socket = new ReconnectingWebSocket(address, protocols, options);
    socket.onopen = function() {
        this.emit('open');
    };
    socket.onclose = function() {
        this.emit('close');
    };
    socket.onmessage = function(evt) {
        this.emit('message', evt);
    };
    socket.onerror = function(evt) {
        this.emit('error', evt);
    };

    this._socket = socket;
    this.readyState = socket.readyState;

}

util.inherits(SiLinWebSocket, EventEmitter);

SiLinWebSocket.prototype.send = function (data) {
    this._socket.send(data);
};

SiLinWebSocket.prototype.refresh = function (data) {
    this._socket.refresh();
};


medule.exports = SiLinWebSocket;
