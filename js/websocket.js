/**
 * Created by sergey on 12.08.16.
 */

var msgListBlock, sendMsg, sendBtn, notificationBlock, ws;

window.onload = function () {
    msgListBlock = document.getElementById("subscribe");
    sendMsg = document.getElementById("sendMsg");
    sendBtn = document.getElementById("sendBtn");
    logBlock = document.getElementsByClassName("log");
    notificationBlock = document.getElementsByClassName("notification");

    logMessage(logBlock[0], "Connecting to the chat...");

    // Connect to websocket;

    /*ws = new WebSocket("ws://192.168.0.110:8080");

    ws.onopen = function (event) {
        notificationBlock[0].innerHTML = "Successfully connected to the chat!";
        console.log(event);
    };

    ws.onerror = function (event) {
        console.log(event);
        notificationBlock[0].innerHTML = "We have problems with connection to the chat. Sorry!";
    };

    ws.onclose = function (event) {
        notificationBlock[0].innerHTML = "Disconnected!";
    };

    ws.close();*/

    runSocket();
};

function logMessage(obj, message, logLevel) {
    logLevel = (logLevel) ? "[" + logLevel + "]" : "[INFO]";
    showMessage(obj, message, logLevel);
}

function showMessage(obj, message, logLevel) {
    var messageElem = document.createElement('div');

    if (logLevel) {
        message = logLevel + ": " + message;
    }

    messageElem.appendChild(document.createTextNode(message));
    obj.appendChild(messageElem);
}

function runSocket() {
    ws = WS.connect("ws://213.159.214.136:8080");

    ws.on("socket/connect", function(session){
        logMessage(logBlock[0], "Successfully connected to the chat!");

        session.subscribe("app/chat/general/1", function (uri, payload) {
            prepareReceivedData(uri, payload);
        });

        document.forms.chatroom.onsubmit = function() {
            var outgoingMessage = this.message.value;

            if (!outgoingMessage) return false;

            var msg = {
                type: "message",
                body: {
                    message: outgoingMessage
                },
                version:   "1.0.0"
            };

            this.message.value = "";

            session.publish("app/chat/general/1", msg);

            return false;
        };
    });

    ws.on("socket/disconnect", function(error){
        //error provides us with some insight into the disconnection: error.reason and error.code

        logMessage(logBlock[0], error.reason, "ERROR");
        logMessage(logBlock[0], "We have problems with connection to the chat. Sorry!", "ERROR");
    });
}

function prepareReceivedData(uri, payload) {
    console.log(payload);

    var outMsg, msg_timestamp, msg, d;

    msg_timestamp = Date.now();

    if (payload.msg["body"] != undefined) {
        if (payload.msg.body["date"])
            msg_timestamp = payload.msg.body["date"] * 1000;

        if (payload.msg.body["message"])
            msg = payload.msg.body["message"];
        else
            msg = payload["msg"];
    }


    d = new Date(msg_timestamp).toLocaleString();

    outMsg = d + ": " + msg;

    switch(payload.msg.type) {
        case "message":

            showMessage(msgListBlock, outMsg);

            break;

        case "message:service":

            logMessage(logBlock[0], outMsg);

            break;
    }
}