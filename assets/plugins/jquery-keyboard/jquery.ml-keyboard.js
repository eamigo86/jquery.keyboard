(function($){
    // Definicion de la clase tecla
    function Key(params) {
        if (Object.prototype.toString.call(params) == "[object Arguments]") {
            this.keyboard = params[0];
        } else {
            this.keyboard = params;
        }
        this.$key = $("<li/>");
        this.current_value = null;
    }

    Key.prototype.render = function() {
        if (this.id) {
            this.$key.attr("id", this.id);
        }
        return this.$key;
    };

    Key.prototype.setCurrentValue = function() {
        if (this.keyboard.upperRegister()) {
            this.current_value = this.preferences.u ? this.preferences.u : this.default_value;
        } else {
            this.current_value = this.preferences.d ? this.preferences.d : this.default_value;
        }
        this.$key.text(this.current_value);
    };

    Key.prototype.setCurrentAction = function() {
        var _this = this;

        this.$key.unbind("click.mlkeyboard");
        this.$key.bind("click.mlkeyboard", function(){
            _this.keyboard.keep_focus = true;

            if (typeof(_this.preferences.onClick) === "function") {
              _this.preferences.onClick(_this);
            } else {
              _this.defaultClickAction();
            }
        });
    };

    Key.prototype.defaultClickAction = function() {
        this.keyboard.destroyModifications();

        if (this.is_modificator) {
            this.keyboard.deleteChar();
            this.keyboard.printChar(this.current_value);
        } else {
            this.keyboard.printChar(this.current_value);
        }

        if (this.preferences.m && Object.prototype.toString.call(this.preferences.m) === '[object Array]') {
            this.showModifications();
        }

        if (this.keyboard.active_shift) {
            this.keyboard.toggleShift(false);
        }
    };

    Key.prototype.showModifications = function() {
        var _this = this;

        this.keyboard.modifications = [];

        $.each(this.preferences.m, function(i, modification) {
            var key = new Key(_this.keyboard);
            key.is_modificator = true;
            key.preferences = modification;
            _this.keyboard.modifications.push(key);
        });

        this.keyboard.showModifications(this);
    };

    Key.prototype.toggleActiveState = function() {
        if (this.isActive()) {
          this.$key.addClass('active');
        } else {
          this.$key.removeClass('active');
        }
    };

    Key.prototype.isActive = function() {
        return false;
    };


    /******************************************************************/
    /* Comenzamos a definir el comportamiento de las teclas especiales*/
    /******************************************************************/

    /**********/
    /* DELETE */
    /**********/
    function KeyDelete() {
        Key.call(this, arguments);

        this.id = "mlkeyboard-backspace";
        this.default_value = 'Delete';
    }

    KeyDelete.prototype = new Key();
    KeyDelete.prototype.constructor = KeyDelete;

    KeyDelete.prototype.defaultClickAction = function() {
        this.keyboard.deleteChar();
    };

    /*******/
    /* TAB */
    /*******/
    function KeyTab() {
        Key.call(this, arguments);

        this.id = "mlkeyboard-tab";
        this.default_value = 'Tab';
    }

    KeyTab.prototype = new Key();
    KeyTab.prototype.constructor = KeyTab;

    KeyTab.prototype.defaultClickAction = function() {
        // TODO: It's doesn't work if inputs has different parents
        this.keyboard.$current_input.next(":input").focus();
    };

    /*************/
    /* CAPS LOCK */
    /*************/
    function KeyCapsLock() {
        Key.call(this, arguments);

        this.id = "mlkeyboard-capslock";
        this.default_value = 'Caps Lock';
    }

    KeyCapsLock.prototype = new Key();
    KeyCapsLock.prototype.constructor = KeyCapsLock;

    KeyCapsLock.prototype.isActive = function() {
        return this.keyboard.active_caps;
    };

    KeyCapsLock.prototype.defaultClickAction = function() {
        this.keyboard.toggleCaps();
    };


    /*********/
    /* ENTER */
    /*********/
    function KeyReturn() {
        Key.call(this, arguments);

        this.id = "mlkeyboard-return";
        this.default_value = 'Return';
    }

    KeyReturn.prototype = new Key();
    KeyReturn.prototype.constructor = KeyReturn;

    KeyReturn.prototype.defaultClickAction = function() {
        var e = $.Event("keypress", {
            which: 13,
            keyCode: 13
        });
        this.keyboard.$current_input.trigger(e);
    };


    /*********/
    /* SHIFT */
    /*********/
    function KeyShift() {
        Key.call(this, arguments);

        this.id = "mlkeyboard-"+arguments[1]+"-shift";
        this.default_value = 'Shift';
    }

    KeyShift.prototype = new Key();
    KeyShift.prototype.constructor = KeyShift;

    KeyShift.prototype.isActive = function() {
        return this.keyboard.active_shift;
    };

    KeyShift.prototype.defaultClickAction = function() {
        this.keyboard.toggleShift();
    };


    /*********/
    /* SPACE */
    /*********/
    function KeySpace() {
        Key.call(this, arguments);

        this.id = "mlkeyboard-space";
        this.default_value = 'Space';
    }

    KeySpace.prototype = new Key();
    KeySpace.prototype.constructor = KeySpace;

    KeySpace.prototype.defaultClickAction = function() {
        this.keyboard.printChar(' ');
    };


    //var KEYS_COUNT = 53;    // Cantidad de teclas a dibujar(por default: 53, solo keypad, sin numpad)

    function Keyboard(options){
        // Default options
        this.defaults = {
            keys_count: 53,     // Cantidad de teclas a dibujar(por default: 53, solo keypad, sin numpad)
            layout: 'en_US',
            active_shift: false,
            active_caps: false,
            is_hidden: true,
            open_speed: 300,
            close_speed: 100,
            show_on_focus: true,
            hide_on_blur: true,
            trigger: undefined,
            enabled: true
        };


        /* INICIALIZAMOS LOS VALORES */
        this.global_options = $.extend({}, this.defaults, options);
        this.options = $.extend({}, {}, this.global_options);

        this.keys = [];

        this.$keyboard = $("<div/>").attr("id", "mlkeyboard");
        this.$modifications_holder = $("<ul/>").addClass('mlkeyboard-modifications');
        this.$current_input = $("input[type='text']").first();
    }

    // Constructor de la Clase Keyboard
    Keyboard.prototype.init = function() {
        this.$keyboard.append(this.renderKeys());
        this.$keyboard.append(this.$modifications_holder);
        $("body").append(this.$keyboard);

        if (this.options.is_hidden){
            this.$keyboard.hide();
        }

        this.setUpKeys();
    };

    Keyboard.prototype.setUpKeys = function() {
        var _this = this;

        this.active_shift = this.options.active_shift;
        this.active_caps = this.options.active_caps;

        $.each(this.keys, function(i, key){
            key.preferences = mlKeyboard.layouts[_this.options.layout][i];
            key.setCurrentValue();
            key.setCurrentAction();
            key.toggleActiveState();
        });
    };

    Keyboard.prototype.renderKeys = function() {
        var $keys_holder = $("<ul/>");

        for (var i = 0; i<= this.options.keys_count; i++) {
            var key;

            switch(i) {
                case 13:
                    key = new KeyDelete(this);
                    break;
                case 14:
                    key = new KeyTab(this);
                    break;
                case 28:
                    key = new KeyCapsLock(this);
                    break;
                case 40:
                    key = new KeyReturn(this);
                    break;
                case 41:
                    key = new KeyShift(this, "left");
                    break;
                case 52:
                    key = new KeyShift(this, "right");
                    break;
                case 53:
                    key = new KeySpace(this);
                    break;
                default:
                    key = new Key(this);
                    break;
            }

            this.keys.push(key);
                $keys_holder.append(key.render());
        }

        return $keys_holder;
    };

    // Definimos cuando y como se mostrara el Keyboard
    Keyboard.prototype.setUpFor = function($input) {
        var _this = this;

        if (this.options.show_on_focus) {
            $input.bind('focus', function() { _this.showKeyboard($input); });
        }

        if (this.options.hide_on_blur) {
            $input.bind('blur', function() {
                var VERIFY_STATE_DELAY = 500;

                // Input focus changes each time when user click on keyboard key
                // To prevent momentary keyboard collapse input state verifies with timers help
                // Any key click action set current inputs keep_focus variable to true
                clearTimeout(_this.blur_timeout);

                _this.blur_timeout = setTimeout(function(){
                    if (!_this.keep_focus){
                        _this.hideKeyboard();
                    }
                    else{
                        _this.keep_focus = false;
                    }
                }, VERIFY_STATE_DELAY);
            });
        }

        if (this.options.trigger) {
            var $trigger = $(this.options.trigger);
            $trigger.bind('click', function(e) {
                e.preventDefault();

                if (_this.isVisible){
                    _this.hideKeyboard();
                }
                else {
                    _this.showKeyboard($input);
                    $input.focus();
                }
           });
        }
    };

    // Mostramos el Keyboard
    Keyboard.prototype.showKeyboard = function($input) {
        var input_changed = !this.$current_input || $input[0] !== this.$current_input[0];

        if (!this.keep_focus || input_changed) {
            if (input_changed) this.keep_focus = true;

            this.$current_input = $input;
            this.options = $.extend({}, this.global_options, this.inputLocalOptions());

            if (!this.options.enabled) {
                this.keep_focus = false;
                return;
            }

            if (this.$current_input.val() !== '') {
                this.options.active_shift = false;
            }

            this.setUpKeys();

            if (this.options.is_hidden) {
                this.isVisible = true;
                this.$keyboard.slideDown(this.options.openSpeed);
            }
        }
    };

    // Escondemos el Keyboard
    Keyboard.prototype.hideKeyboard = function() {
        if (this.options.is_hidden) {
            this.isVisible = false;
            this.$keyboard.slideUp(this.options.closeSpeed);
        }
    };

    // Leemos las opciones introducidas por el usuario
    Keyboard.prototype.inputLocalOptions = function() {
        var options = {};
        for (var key in this.defaults) {
            var input_option = this.$current_input.attr("data-mlkeyboard-"+key);
            if (input_option == "false") {
                input_option = false;
            }
            else if (input_option == "true") {
                input_option = true;
            }
            if (typeof input_option !== 'undefined'){
                options[key] = input_option;
            }
        }

        return options;
    };

    // Dibujamos el caracter correspondiente
    Keyboard.prototype.printChar = function(char) {
        var current_val = this.$current_input.val();
        this.$current_input.val(current_val + char);
        this.$current_input.focus().trigger("input");
    };

    // Borramos el caracter correspondiente (el ultimo)
    Keyboard.prototype.deleteChar = function() {
        var current_val = this.$current_input.val();
        this.$current_input.val(current_val.slice(0,-1));
        this.$current_input.focus().trigger("input");
    };

    // ?
    Keyboard.prototype.showModifications = function(caller) {
        var _this = this,
            holder_padding = parseInt(_this.$modifications_holder.css('padding'), 10),
            top, left, width;

        $.each(this.modifications, function(i, key){
            _this.$modifications_holder.append(key.render());

            key.setCurrentValue();
            key.setCurrentAction();
        });

        // TODO: Remove magic numbers
        width = (caller.$key.width() * _this.modifications.length) + (_this.modifications.length * 6);
        top = caller.$key.position().top - holder_padding;
        left = caller.$key.position().left - _this.modifications.length * caller.$key.width()/2;

        this.$modifications_holder.one('mouseleave', function(){
            _this.destroyModifications();
        });

        this.$modifications_holder.css({
            width: width,
            top: top,
            left: left
        }).show();
    };

    // ?
    Keyboard.prototype.destroyModifications = function() {
        this.$modifications_holder.empty().hide();
    };

    // ?
    Keyboard.prototype.upperRegister = function() {
        return ((this.active_shift && !this.active_caps) || (!this.active_shift && this.active_caps));
    };

    // Activamos o desactivamos Shift
    Keyboard.prototype.toggleShift = function(state) {
        this.active_shift = state ? state : !this.active_shift;
        this.changeKeysState();
    };

    // Activamos o desactivamos Tab
    Keyboard.prototype.toggleCaps = function(state) {
        this.active_caps = state ? state : !this.active_caps;
        this.changeKeysState();
    };

    // Cambiamos el caracter de la letra de acuerdo a si esta activa la mayuscula o no
    Keyboard.prototype.changeKeysState = function() {
        $.each(this.keys, function(_, key){
            key.setCurrentValue();
            key.toggleActiveState();
        });
    };


    // Creamos la propiedad 'mlKeyboard' a el objeto de jQuery
    $.fn.mlKeyboard = function(options) {
        var keyboard = new Keyboard(options);
        keyboard.init();

        this.each(function(){
            keyboard.setUpFor($(this));
        });
    };

})(jQuery);

// Creamos un contenedor de caracteres vacio
var mlKeyboard = mlKeyboard || {layouts: {}};

// Definimos los layouts de acuerdo a cada idioma
mlKeyboard.layouts.en_US = [
    {d: '`', u: '~'},
    {d: '1',u: '!'},
    {d: '2',u: '@'},
    {d: '3',u: '#'},
    {d: '4',u: '$'},
    {d: '5',u: '%'},
    {d: '6',u: '^'},
    {d: '7',u: '&'},
    {d: '8',u: '*'},
    {d: '9',u: '('},
    {d: '0',u: ')'},
    {d: '-',u: '_'},
    {d: '=',u: '+'},
    {}, // Delete
    {}, // Tab
    {d: 'q',u: 'Q'},
    {d: 'w',u: 'W'},
    {d: 'e',u: 'E'},
    {d: 'r',u: 'R'},
    {d: 't',u: 'T'},
    {d: 'y',u: 'Y'},
    {d: 'u',u: 'U'},
    {d: 'i',u: 'I'},
    {d: 'o',u: 'O'},
    {d: 'p',u: 'P'},
    {d: '[',u: '}'},
    {d: ']',u: '{'},
    {d: '\\',u: '|'},
    {}, // Caps lock
    {d: 'a',u: 'A'},
    {d: 's',u: 'S'},
    {d: 'd',u: 'D'},
    {d: 'f',u: 'F'},
    {d: 'g',u: 'G'},
    {d: 'h',u: 'H'},
    {d: 'j',u: 'J'},
    {d: 'k',u: 'K'},
    {d: 'l',u: 'L'},
    {d: ';',u: ':'},
    {d: '\'',u: '"'},
    {}, // Return
    {}, // Left shift
    {d: 'z',u: 'Z'},
    {d: 'x',u: 'X'},
    {d: 'c',u: 'C'},
    {d: 'v',u: 'V'},
    {d: 'b',u: 'B'},
    {d: 'n',u: 'N'},
    {d: 'm',u: 'M'},
    {d: ',',u: '<'},
    {d: '.',u: '>'},
    {d: '/',u: '?'},
    {}, // Right shift
    {}  // Space
];


mlKeyboard.layouts.ru_RU = [
    {d: 'ё',u: 'Ё'},
    {d: '1',u: '!'},
    {d: '2',u: '\''},
    {d: '3',u: '№'},
    {d: '4',u: '%'},
    {d: '5',u: ':'},
    {d: '6',u: ','},
    {d: '7',u: '.'},
    {d: '8',u: ';'},
    {d: '9',u: '('},
    {d: '0',u: ')'},
    {d: '-',u: '_'},
    {d: '=',u: '+'},
    {}, // Delete
    {}, // Tab
    {d: 'й',u: 'Й'},
    {d: 'ц',u: 'Ц'},
    {d: 'у',u: 'У'},
    {d: 'к',u: 'К'},
    {d: 'е',u: 'Е'},
    {d: 'н',u: 'Н'},
    {d: 'г',u: 'Г'},
    {d: 'ш',u: 'Ш'},
    {d: 'щ',u: 'Щ'},
    {d: 'з',u: 'З'},
    {d: 'х',u: 'Х'},
    {d: 'ъ',u: 'Ъ'},
    {d: '|',u: '\\'},
    {}, // Caps Lock
    {d: 'ф',u: 'Ф'},
    {d: 'ы',u: 'Ы'},
    {d: 'в',u: 'В'},
    {d: 'а',u: 'А'},
    {d: 'п',u: 'П'},
    {d: 'р',u: 'Р'},
    {d: 'о',u: 'О'},
    {d: 'л',u: 'Л'},
    {d: 'д',u: 'Д'},
    {d: 'ж',u: 'Ж'},
    {d: 'э',u: 'Э'},
    {}, // Return
    {}, // Left Shift
    {d: 'я',u: 'Я'},
    {d: 'ч',u: 'Ч'},
    {d: 'с',u: 'С'},
    {d: 'м',u: 'М'},
    {d: 'и',u: 'И'},
    {d: 'т',u: 'Т'},
    {d: 'ь',u: 'Ь'},
    {d: 'б',u: 'Б'},
    {d: 'ю',u: 'Ю'},
    {d: '.',u: ','},
    {}, // Right Shift
    {} // Space
];


mlKeyboard.layouts.es_ES = [
    {d: '<', u: '>'},
    {d: '1',u: '¡'},
    {d: '2',u: '!'},
    {d: '3',u: '#'},
    {d: '4',u: '$'},
    {d: '5',u: '%'},
    {d: '6',u: '/'},
    {d: '7',u: '&'},
    {d: '8',u: '*'},
    {d: '9',u: '('},
    {d: '0',u: ')'},
    {d: '-',u: '_'},
    {d: '=',u: '+'},
    {}, // Delete
    {}, // Tab
    {d: 'q',u: 'Q'},
    {d: 'w',u: 'W'},
    {d: 'e',u: 'E', m: [
        {d: 'e', u: 'E'},
        {d: 'é', u: 'É'}
    ]},
    {d: 'r',u: 'R'},
    {d: 't',u: 'T'},
    {d: 'y',u: 'Y'},
    {d: 'u',u: 'U', m: [
        {d: 'u', u: 'U'},
        {d: 'ú', u: 'Ú'},
        {d: 'ü', u: 'Ü'}
    ]},
    {d: 'i',u: 'I', m: [
        {d: 'i', u: 'I'},
        {d: 'í', u: 'Í'}
    ]},
    {d: 'o',u: 'O', m: [
        {d: 'o', u: 'O'},
        {d: 'ó', u: 'Ó'}
    ]},
    {d: 'p',u: 'P'},
    {d: '´',u: 'º'},
    {d: '`',u: '¨'},
    {d: '\'',u: '"'},
    {}, // Caps lock
    {d: 'a',u: 'A', m: [
        {d: 'a', u: 'A'},
        {d: 'á', u: 'Á'}
    ]},
    {d: 's',u: 'S'},
    {d: 'd',u: 'D'},
    {d: 'f',u: 'F'},
    {d: 'g',u: 'G'},
    {d: 'h',u: 'H'},
    {d: 'j',u: 'J'},
    {d: 'k',u: 'K'},
    {d: 'l',u: 'L'},
    {d: 'ñ',u: 'Ñ'},
    {d: ';',u: ':'},
    {}, // Return
    {}, // Left shift
    {d: 'z',u: 'Z'},
    {d: 'x',u: 'X'},
    {d: 'c',u: 'C'},
    {d: 'v',u: 'V'},
    {d: 'b',u: 'B'},
    {d: 'n',u: 'N'},
    {d: 'm',u: 'M'},
    {d: ',',u: '¿'},
    {d: '.',u: '?'},
    {d: 'ç',u: 'Ç'},
    {}, // Right shift
    {}  // Space
];


mlKeyboard.layouts.pt_PT = [
    {d: '\/', u: '|'},
    {d: '1',u: '!'},
    {d: '2',u: '"'},
    {d: '3',u: '#'},
    {d: '4',u: '$'},
    {d: '5',u: '%'},
    {d: '6',u: '&'},
    {d: '7',u: '/'},
    {d: '8',u: '('},
    {d: '9',u: ')'},
    {d: '0',u: '='},
    {d: '-',u: '?'},
    {d: '~',u: '^'},
    {}, // Delete
    {}, // Tab
    {d: 'q',u: 'Q'},
    {d: 'w',u: 'W'},
    {d: 'e',u: 'E', m: [
        {d: 'e', u: 'E'},
        {d: 'é', u: 'É'}
    ]},
    {d: 'r',u: 'R'},
    {d: 't',u: 'T'},
    {d: 'y',u: 'Y'},
    {d: 'u',u: 'U', m: [
        {d: 'u', u: 'U'},
        {d: 'ú', u: 'Ú'}
    ]},
    {d: 'i',u: 'I', m: [
        {d: 'i', u: 'I'},
        {d: 'í', u: 'Í'}
    ]},
    {d: 'o',u: 'O', m: [
        {d: 'o', u: 'O'},
        {d: 'ó', u: 'Ó'},
        {d: 'õ', u: 'Õ'},
        {d: 'ô', u: 'Ô'}
    ]},
    {d: 'p',u: 'P'},
    {d: '´',u: 'º'},
    {d: '`',u: '¨'},
    {d: '\'',u: '"'},
    {}, // Caps lock
    {d: 'a',u: 'A', m: [
        {d: 'a', u: 'A'},
        {d: 'á', u: 'Á'},
        {d: 'à', u: 'À'},
        {d: 'ã', u: 'Ã'},
        {d: 'â', u: 'Â'}
    ]},
    {d: 's',u: 'S'},
    {d: 'd',u: 'D'},
    {d: 'f',u: 'F'},
    {d: 'g',u: 'G'},
    {d: 'h',u: 'H'},
    {d: 'j',u: 'J'},
    {d: 'k',u: 'K'},
    {d: 'l',u: 'L'},
    {d: 'ñ',u: 'Ñ'},
    {d: ';',u: ':'},
    {}, // Return
    {}, // Left shift
    {d: 'z',u: 'Z'},
    {d: 'x',u: 'X'},
    {d: 'c',u: 'C', m: [
        {d: 'c', u: 'C'},
        {d: 'ç', u: 'Ç'}
    ]},
    {d: 'v',u: 'V'},
    {d: 'b',u: 'B'},
    {d: 'n',u: 'N'},
    {d: 'm',u: 'M'},
    {d: ',',u: '¿'},
    {d: '.',u: '?'},
    {d: 'ç',u: 'Ç'},
    {}, // Right shift
    {}  // Space
];


mlKeyboard.layouts.it_IT = [
    {d: '\\', u: '|'},
    {d: '1',u: '!'},
    {d: '2',u: '"'},
    {d: '3',u: '£'},
    {d: '4',u: '$'},
    {d: '5',u: '%'},
    {d: '6',u: '&'},
    {d: '7',u: '/'},
    {d: '8',u: '('},
    {d: '9',u: ')'},
    {d: '0',u: '='},
    {d: '\'',u: '?'},
    {d: 'ì',u: '^'},
    {}, // Delete
    {}, // Tab
    {d: 'q',u: 'Q'},
    {d: 'w',u: 'W'},
    {d: 'e',u: 'E'},
    {d: 'r',u: 'R'},
    {d: 't',u: 'T'},
    {d: 'y',u: 'Y'},
    {d: 'u',u: 'U'},
    {d: 'i',u: 'I'},
    {d: 'o',u: 'O'},
    {d: 'p',u: 'P'},
    {d: 'e',u: 'é', m: [
        {d: 'e', u: 'é'},
        {d: '[', u: '{'}
    ]},
    {d: '+',u: '*', m: [
        {d: '+', u:'*'},
        {d: ']', u: '}'}
    ]},
    {}, // Caps lock
    {d: 'a',u: 'A'},
    {d: 's',u: 'S'},
    {d: 'd',u: 'D'},
    {d: 'f',u: 'F'},
    {d: 'g',u: 'G'},
    {d: 'h',u: 'H'},
    {d: 'j',u: 'J'},
    {d: 'k',u: 'K'},
    {d: 'l',u: 'L'},
    {d: 'ò',u: 'ç', m:[
        {d: 'ò',u: 'ç'},
        {d:'@', u: 'Ç'}
    ]},
    {d: 'à',u: '°', m:[
        {d: 'à',u: '°'},
        {d:'#', u: '∞'}
    ]},
    {d: 'ù',u: '§'},
    {}, // Return
    {}, // Left shift
    {d: '<', u:'>'},
    {d: 'z',u: 'Z'},
    {d: 'x',u: 'X'},
    {d: 'c',u: 'C'},
    {d: 'v',u: 'V'},
    {d: 'b',u: 'B'},
    {d: 'n',u: 'N'},
    {d: 'm',u: 'M'},
    {d: ',',u: ';'},
    {d: '.',u: ':'},
    {d: '-',u: '_'},
    {}, // Right shift
    {}  // Space
];