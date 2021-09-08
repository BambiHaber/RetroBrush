var events = {
    EVENT_COLOR_SELECTED: "EVENT_COLOR_SELECTED",
    EVENT_PAINT_MODE_SELECTED: "EVENT_PAINT_MODE_SELECTED",
    EVENT_SPRAY_MODE_SELECTED: "EVENT_SPRAY_MODE_SELECTED",
    EVENT_ERASER_SELECTED: "EVENT_ERASER_SELECTED",
    EVENT_UNDO_SELECTED: "EVENT_UNDO_SELECTED",
    EVENT_OPEN_FILE_CLICKED: "EVENT_OPEN_FILE_CLICKED",
    EVENT_SAVE_FILE_CLICKED: "EVENT_SAVE_FILE_CLICKED"
};
var colors = [
    "fff",
    "c3c7cb",
    "ff0000",
    "ffff00",
    "00ff00",
    "00ffff",
    "0000ff",
    "ff00ff",
    "ffff81",
    "00ff7e",
    "81ffff",
    "7e7eff",
    "ff007e",
    "ff7e3f",
    "000",
    "868a8e",
    "aa0055",
    "aaaa55",
    "00aa55",
    "55aaac",
    "000097",
    "aa55aa",
    "989a72",
    "2b5656",
    "0081ff",
    "2a54aa",
    "562baa",
    "aa5655"
];

var CanvasContextHandler = function (options) {

    this.eventBus = options.eventBus;
    this.canvasCtx = options.canvasCtx;
    this.canvasEl = options.canvasEl;
    this.historyStack = options.historyStack;

    this.canvasEl.setAttribute("height", window.getComputedStyle(this.canvasEl, null).getPropertyValue("height"))
    this.canvasEl.setAttribute("width", window.innerWidth - document.querySelector('#leftPanel').clientWidth + document.querySelector('#leftPanel').getBoundingClientRect().x);
    window.addEventListener("resize", (e) => {
        let imageData = this.canvasEl.toDataURL();
        var img = new Image();
        img.onload = () => {
            this.canvasEl.setAttribute("height", window.getComputedStyle(this.canvasEl, null).getPropertyValue("height"))
            this.canvasEl.setAttribute("width", window.innerWidth - document.querySelector('#leftPanel').clientWidth + document.querySelector('#leftPanel').getBoundingClientRect().x);
            this.canvasCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.canvasEl.width, this.canvasEl.height);
        }
        img.src = imageData;

    })

    // -- Color selection

    var onColorSelected = function (model) {
        document.querySelector("#chosenColor").style = "background-color:#" + model.chosenColor + ";";
        this.canvasCtx.strokeStyle = '#' + model.chosenColor;
    }.bind(this);

    // -- Perform Undo
    var onUndoSelected = function () {
        this.canvasCtx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
        var img = new Image();
        img.onload = function () {
            this.canvasCtx.drawImage(img, 0, 0);
        }.bind(this);
        var imageFromHistory = this.historyStack[this.historyStack.length - 1] || null;
        if (imageFromHistory != null) {
            img.src = imageFromHistory;
            this.historyStack.pop();
        }
    }.bind(this);

    var onOpenFileClicked = function (e) {
        e.currentTarget.parentElement.querySelector('#openFileInput').click()
    }.bind(this);

    var onSaveFileClicked = function (e) {
        Alert('tbd!');
    }.bind(this);

    this.eventBus.on(events.EVENT_COLOR_SELECTED, onColorSelected);
    this.eventBus.on(events.EVENT_UNDO_SELECTED, onUndoSelected);
    this.eventBus.on(events.EVENT_OPEN_FILE_CLICKED, onOpenFileClicked);
    this.eventBus.on(events.EVENT_SAVE_FILE_CLICKED, onSaveFileClicked);
};

var MainView = function (options) {
    this.historyStack = [];

    this.colorContainerEl = options.colorContainerEl;
    this.canvasEl = options.canvasEl;
    this.canvasCtx = this.canvasEl.getContext('2d');
    this.widthContainerEl = options.widthContainerEl;
    this.eventBus = options.eventBus;
    this.navContainerEl = options.navContainerEl;
    this.openFileEl = options.openFileEl;
    this.openFileInputEl = options.openFileInputEl;

    this.canvasContextHandler = new CanvasContextHandler({
        canvasEl: this.canvasEl,
        eventBus: this.eventBus,
        canvasCtx: this.canvasCtx,
        historyStack: this.historyStack
    });

    var saveToHistory = function (data) {
        this.historyStack.push(data);
        if (this.historyStack.length > 20) {
            this.historyStack.shift();
        }
    }.bind(this);

    var generateButtons = function () {
        for (var i = 0; i < colors.length; i++) {
            var colorElement = document.createElement('div');
            colorElement.classList.add('color');
            colorElement.dataset.shade = colors[i];
            if (i % 14 == 0 && i != 0) {
                this.colorContainerEl.appendChild(document.createElement('br'));
            }
            this.colorContainerEl.appendChild(colorElement);
        }
    }.bind(this);

    var generateCssClasses = function () {
        var cssMarkup = [];
        var style = document.createElement('style');
        style.type = 'text/css';

        for (var i = 0; i < colors.length; i++) {
            cssMarkup.push('.color[data-shade="' + colors[i] + '"] {background:#' + colors[i] + ';}');
        }
        style.innerHTML = cssMarkup.join('\r\n');
        document.getElementsByTagName('head')[0].appendChild(style);
    };

    var bindButtonEvents = function () {
        var colorEl = document.querySelectorAll('.color');
        for (var i = 0; i < colorEl.length; i++) {
            colorEl[i].addEventListener('click', function (e) {
                this.eventBus.trigger(events.EVENT_COLOR_SELECTED, {
                    chosenColor: e.target.dataset.shade
                });
            }.bind(this));
        }
    }.bind(this);
    var bindMouseEvents = function () {
        this.eventBus.on(events.EVENT_PAINT_MODE_SELECTED, function (ev) {

            document.querySelectorAll('.toolsContainer div').forEach((el) => {
                el.classList.remove('selected');
            });
            if (ev['eraser'] && ev['eraser'] === true) {
                document.querySelector('.eraser').classList.add('selected');
            } else {
                ev.classList.add('selected');
            }
            this.canvasEl.onmousedown = function (e) {
                saveToHistory(this.canvasEl.toDataURL());
                this.canvasCtx.beginPath();
                this.canvasEl.onmousemove = function (evt) {
                    let rect = this.canvasEl.getBoundingClientRect();
                    var x = evt.clientX - this.canvasEl.offsetLeft;
                    var y = evt.clientY - this.canvasEl.offsetTop;
                    this.canvasCtx.lineTo(x, y);
                    this.canvasCtx.stroke();
                }.bind(this);
                this.canvasCtx.closePath();
            }.bind(this);

        }.bind(this));
        // unbinder for when leaving mouse...
        this.canvasEl.onmouseup = function (evt) {
            this.canvasEl.onmousemove = null;
        }.bind(this);

        this.eventBus.on(events.EVENT_SPRAY_MODE_SELECTED, function (e) {
            e.classList.add('selected');
            this.canvasEl.onmousedown = function (e) {
                var dotsDistance = 30; //Can be dynamic in the future choosing big spray or small spray
                var numberOfDots = Number.parseInt(Math.random() * 30);
                saveToHistory(this.canvasEl.toDataURL());

                for (var i = 0; i < numberOfDots; i++) {
                    this.canvasCtx.beginPath();
                    this.canvasEl.onmousemove = function (evt) {
                        var x = evt.pageX - this.canvasEl.offsetLeft + Number.parseInt(Math.random() * 10);
                        var y = evt.pageY - this.canvasEl.offsetTop + Number.parseInt(Math.random() * 10);
                        this.canvasCtx.rect(x, y, 1, 1);
                        this.canvasCtx.stroke();
                    }.bind(this);
                }
                this.canvasCtx.closePath();
            }.bind(this);
        }.bind(this));

        this.eventBus.on(events.EVENT_ERASER_SELECTED, function (ev) {
            /**
             *  So i actually cheat here, because the eraser is actually paint mode with white color
             *  ..at the moment it would trigger the two events of: white color selection, and paint mode selection
             *  in the future it would have to be different because probably the "toolbox" would contain
             *  an indication of the selected tool, also, maybe an alpha channel would be added
             **/
            this.eventBus.trigger(events.EVENT_PAINT_MODE_SELECTED, {eraser: true});
            this.eventBus.trigger(events.EVENT_COLOR_SELECTED, {
                chosenColor: colors[0]
            });
        }.bind(this));
    }.bind(this);
    var bindWidthButtonsEvents = function () {
        var widthElements = this.widthContainerEl.getElementsByTagName('li');
        for (var i = 0; i < widthElements.length; i++) {
            widthElements[i].addEventListener("click", function (currentEl) {
                for (var j = 0; j < widthElements.length; j++) {
                    widthElements[j].classList.remove("selected");
                }
                currentEl.currentTarget.classList.add('selected');
                this.canvasCtx.lineWidth = currentEl.currentTarget.dataset.strokeWidth;
            }.bind(this));
        }
    }.bind(this);
    var bindToolsEvents = function () {
        /**
         * IMPORTANT: When choosing other painting tools dont forget to unbind the other events
         * for instance when spray is on remove paint
         * and vice versa
         *
         */
        // -- undo --
        document.querySelector('.undo').addEventListener('click', function (e) {
            this.eventBus.trigger(events.EVENT_UNDO_SELECTED, e.currentTarget);
        }.bind(this));

        // -- paint --
        document.querySelector('.paint').addEventListener('click', function (e) {
            this.eventBus.trigger(events.EVENT_PAINT_MODE_SELECTED, e.currentTarget);
        }.bind(this));

        // -- spray --
        document.querySelector('.spray').addEventListener('click', function (e) {
            this.eventBus.trigger(events.EVENT_SPRAY_MODE_SELECTED, e.currentTarget);
        }.bind(this));

        // -- eraser --
        document.querySelector('.eraser').addEventListener('click', function (e) {
            this.eventBus.trigger(events.EVENT_ERASER_SELECTED, e.currentTarget);
        }.bind(this));
    }.bind(this);
    var bindFileEvents = function () {
        this.openFileEl.addEventListener('click', function (e) {
            this.eventBus.trigger(events.EVENT_OPEN_FILE_CLICKED, e.currentTarget);
        }.bind(this))
        this.navContainerEl.querySelector('.saveFile').addEventListener('click', function (e) {
            this.eventBus.trigger(events.EVENT_SAVE_FILE_CLICKED, e.currentTarget);
        }.bind(this))
    }.bind(this)

    var bindFileChanges = function () {
        this.openFileInputEl.addEventListener('change', function (e) {
            if (e.currentTarget.files && e.currentTarget.files[0]) {
                var fr = new FileReader();
                fr.readAsDataURL(e.currentTarget.files[0])
                fr.onload = () => {
                    fr.result;   // onload fires after reading is complete
                    let img = new Image();
                    img.src = fr.result;
                    img.onload = () => {
                        var scale = Math.min(this.canvasEl.width / img.width, this.canvasEl.height / img.height);
                        // get the top left position of the image
                        var x = (this.canvasEl.width / 2) - (img.width / 2) * scale;
                        var y = (this.canvasEl.height / 2) - (img.height / 2) * scale;
                        this.canvasCtx.drawImage(img, x, y, img.width * scale, img.height * scale);

                        /*
                               this.canvasCtx.drawImage(img, 0, 0, img.width, img.height,
                                   0, 0, this.canvasEl.width *100 / img.width, this.canvasEl.height *100 / img.height);*/
                    };
                }
            } else {
                alert("Please select an image file: BMP, PNG, JPG")
            }
        }.bind(this))
    }.bind(this)

    generateButtons();
    generateCssClasses();

    bindButtonEvents();
    bindMouseEvents();
    bindWidthButtonsEvents();
    bindToolsEvents();

    bindFileEvents();
    bindFileChanges()

};

document.addEventListener("DOMContentLoaded", function () {

    const colorContainerEl = document.querySelector('#colorContainer');
    const canvasEl = document.querySelector('canvas');
    const widthContainerEl = document.querySelector('.widthContainer');
    const navContainerEl = document.querySelector('nav');
    const openFileEl = navContainerEl.querySelector('.openFile');
    const openFileInputEl = navContainerEl.querySelector('#openFileInput');
    const saveFileEl = navContainerEl.querySelector('.saveFile');


    const eventBus = new EventEmitter();
    window.view = new MainView({
        eventBus: eventBus,
        canvasEl: canvasEl,
        colorContainerEl: colorContainerEl,
        widthContainerEl: widthContainerEl,
        navContainerEl: navContainerEl,
        openFileEl: openFileEl,
        openFileInputEl: openFileInputEl,
        saveFileEl: saveFileEl
    });
});