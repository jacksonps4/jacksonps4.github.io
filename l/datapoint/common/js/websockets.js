function enhancedWebSocket(uri, handler) {
    function getWebSocketUriRoot(path) {
      var loc = window.location, new_uri;
      var newUri = "";
      if (loc.protocol === "https:") {
          newUri = "wss:";
      } else {
          newUri = "ws:";
      }
      newUri += "//" + loc.host;
      newUri += loc.pathname;
      newUri += path;

      return newUri;
    }

    var pending = [];
    var webSocket = new WebSocket(getWebSocketUriRoot(uri));
    var es = {
        "pending": pending,
        "ws": webSocket,
        "isConnected": function() {
            return this.connected;
        },
        "setConnected": function() {
            this.connected = true;

            for (var i = 0; i < this.pending.length; i++) {
                es.send(pending[i]);
            }
        },
        "send": function(msg) {
            if (this.connected) {
                this.ws.send(msg);
            } else {
                this.pending.push(msg);
            }
        }
     };
    webSocket.onopen = function(evt) {
        console.log("Connected to " + uri);

        es.setConnected();

        if (handler.onOpen) {
            handler.onOpen(evt);
        }
    };
    webSocket.onclose = function(evt) {
        console.log("Disconnected from " + uri);
        if (handler.onClose) {
            handler.onClose(evt);
        }
    };
    webSocket.onmessage = function(evt) {
        if (handler.onMessage) {
            handler.onMessage(JSON.parse(evt.data));
        }
    };
    webSocket.onerror = function(evt) {
        console.log("Error: " + evt);
        if (handler.onError) {
            handler.onError(evt);
        }
    };

    return es;
 }