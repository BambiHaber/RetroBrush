/**
 * Event emitter |  a basic event handling
 * class written for job interview at Waves
 * ----------------------------------------
 * 12.2013 | Written by Ofer Haber
 */

var EventEmitter = function () {
    // Array structure [EventName, Callback function, remove after one invocation?]
    this.listeners = [];
};

/**
 * Emitter functions - implementations
 * @type {{on: Function, trigger: Function, once: Function, off: Function}}
 */
EventEmitter.prototype = {

    /**
     * Creates a listener
     * @param event
     * @param callback
     */
    on: function (event, callback) {

        this.listeners.push([event, callback, false]);
    },

    /**
     * Triggers an event, possible to post parameters
     * @param event
     * @param params
     */
    trigger: function (event, params) {
        for (var i = 0; i < this.listeners.length; i++) {
            if (event == this.listeners[i][0]) {
                this.listeners[i][1].apply(null, [params]);
                if (this.listeners[i][2] == true) {
                    this.listeners.splice(this.listeners.indexOf(this.listeners[i]), 1);
                }
            }
        }
    },

    /**
     * Creates a listener which is destroyed after one invocation
     * @param event
     * @param params
     */
    once: function (event, callback) {
        this.listeners.push([event, callback, true]);
    },

    /**
     * Removes all events from function from the listeners
     * @param event
     * @param callback
     */
    off: function (event) {
        for (var i = 0; i < this.listeners.length; i++) {
            if (this.listeners[i][0] == event) {
                this.listeners.splice(this.listeners.indexOf(this.listeners[i]), 1);
            }
        }
    }
};

