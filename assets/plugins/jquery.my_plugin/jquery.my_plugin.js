/**
 * Created by Ing. Ernesto Pérez Amigo on 02/10/2015.
 */
(function($){
    //Clase Mensajear
    var Keyboard = function(elemento, opciones){
        var elementoDOM = $(elemento);

        var language = [];

        //almacenaremos el this para poder manipularlo después sin entrar en conflicto
        var _this = this;

        // Incorporamos las opciones
        var optionsKeyboard = $.extend({
            url: '',
            type: 'gatekeeper',             // Tipo de teclado a dibujar
            theme: 'default',           // Tema o estilo de CSS k se le aplicara al teclado
                                        // Temas disponibles: default, monokai, orange

            language: 'en_US',          // Lenguaje k se utilizara para dibujar el teclado
            active_shift: false,
            active_caps: false,
            is_hidden: true,            // Si el teclado se inicializa oculto o no
            open_speed: 300,            // Velocidad con k se muestra el teclado, default: 0.3 seg
            close_speed: 100,           // Velocidad con k se esconde el teclado, default: 0.1 seg
            show_on_focus_in: true,     // Mostrar el teclado cuando pierda el focus el input
            hide_on_focus_out: true,    // Esconder el teclado cuando pierda el focus el input
            trigger: undefined,         // Id del selector k al ser clickeado mostrara el teclado, ejemplo un boton

            // No funciona aun
            enabled: true
        }, opciones || {});

        var $layout = $("<div id='keyboard' class='row'/>");

        var attr_private = 50;

        _this.attr_public = 50;

        // Métodos Públicos
        _this.init = function(){
            initKeyboard();
        };

        _this.setEnabled = function($value){
            if (!$value){
                $('div#keyboard button').attr('disabled', 'disabled');
                optionsKeyboard.enabled = false;
            }
            else{
                $('div#keyboard button').removeAttr("disabled");
                optionsKeyboard.enabled = true;
            }
        };

        _this.getEnabled = function(){
            return optionsKeyboard.enabled;
        };

        _this.example = function(){
            $.ajax({
                url: '../assets/plugins/jquery.my_plugin/locale/en_US.js',
                dataType: 'script',
                success: function(data) {
                    var items = [];

                    $.each(keys.keypad, function(key, val) {
                        if(val.d && val.u )
                            if(val.d.length == 1)
                                items.push('<button class="btn btn-default" id="'+val.u+'" type="button">'+val.d+'</button>');
                            else
                                items.push('<button class="btn btn-default" id="'+val.d+'" type="button">'+val.u+'</button>');
                    });

                    $layout.append("<div class='col-md-8 col-md-offset-2 row' id='gatekeeper' />");

                    $('<div/>', {
                        'id': 'keypad',
                        'class': 'col-md-9',
                        html: items.join('')
                    }).appendTo('div#gatekeeper');
                },
                statusCode: {
                    404: function() {
                        alert('No se encontro el archivo json!!!!');
                    }
                }
            });
        };

        // Métodos Privados
        initKeyboard = function(){
            $('body').append($layout);

            fill_keyboard();

            if (optionsKeyboard.is_hidden){
                $layout.hide();
            }

            // No funciona la option de disable o enable
            if (!optionsKeyboard.enabled){
                $('div#keyboard button').attr('disabled', 'disabled');
            }
        };

        fill_keyboard = function() {
            $.ajax({
                url: optionsKeyboard.url + 'jquery.my_plugin/locale/' + optionsKeyboard.language + '.js',
                dataType: 'script',
                success: function(data) {
                    language = keys[optionsKeyboard.type];
                    renderKeys();
                },
                statusCode: {
                    404: function() {
                        console.error('No se encontro el archivo del idioma especificado!!!!');
                    }
                }
            });
        };

        renderKeys = function(){
            var keys = [];
            var keys1 = [];

            var divisor = false;

            $.each(language, function(key, val) {
                //if( val.d && val.u )
                if( val.d )
                    if(val.d.length == 1)
                        if(!divisor)
                            keys.push('<button class="btn btn-default letter" data-up="' +  val.u + '" data-down="' +  val.d +'">'+val.d+'</button>');
                        else
                            keys1.push('<button class="btn btn-default" data-up="' +  val.u + '" data-down="' +  val.d +'">'+val.d+'</button>');
                    else
                        if(val.d == 'divisor')
                            divisor = true;
                        else {
                            if(!divisor)
                                keys.push('<button class="btn btn-default ' +  val.d + '">' + val.u + '</button>');
                            else
                                keys1.push('<button class="btn btn-default ' +  val.d + '">' + val.u + '</button>');
                        }
            });

            $layout.append("<div class='col-md-8 col-md-offset-2 row' id='gatekeeper' />");

            $('<div/>', {
                'id': 'keypad',
                'class': 'col-md-9 '+optionsKeyboard.theme,
                html: keys.join('')
            }).appendTo('div#gatekeeper');

            $('<div/>', {
                'id': 'numpad',
                'class': 'col-md-3 '+optionsKeyboard.theme,
                html: keys1.join('')
            }).appendTo('div#gatekeeper');

            _this.setEnabled(optionsKeyboard.enabled);

            setUpFor();
            drawChar();
        };

        hideKeyboard = function() {
            if (!$layout.is(':hidden')) {
                $layout.slideUp(optionsKeyboard.closeSpeed);
            }
        };

        showKeyboard = function() {
            if ($layout.is(':hidden')) {
                $layout.slideDown(optionsKeyboard.openSpeed);
            }
        };

        setUpFor = function() {
            var VERIFY_STATE_DELAY = 300;

            $('div#keypad, div#numpad').mouseenter(function() {
                _this.onFocus = true;
            });
            $('div#keypad, div#numpad').mouseleave(function() {
                _this.onFocus = false;
            });

            if(optionsKeyboard.is_hidden){

                if (optionsKeyboard.show_on_focus_in) {
                    $(elementoDOM).focusin(function() {
                        showKeyboard();
                    });
                }

                if (optionsKeyboard.hide_on_focus_out) {
                    $(elementoDOM).focusout(function() {
                        if(!_this.onFocus)
                            setTimeout(function(){hideKeyboard();}, VERIFY_STATE_DELAY);
                            //hideKeyboard();
                    });
                }

                if (optionsKeyboard.trigger) {
                    var $trigger = $(optionsKeyboard.trigger);
                    $trigger.click(function(e) {
                        e.preventDefault();

                        if ($layout.is(':hidden')){
                            showKeyboard();
                            elementoDOM.focus();

                        }
                        else {
                            if(!_this.onFocus){
                                setTimeout(function(){hideKeyboard();}, VERIFY_STATE_DELAY);
                                //hideKeyboard();
                            }
                        }
                   });
                }
            }
        };

        drawChar = function(){
            var time, shift = false, capslock = false;

            $('div#keyboard').find('button').focusin(function(e){
                time = e.timeStamp;
            });
            $('div#keyboard').find('button').focusout(function(e){
                var diff = parseInt((e.timeStamp - time)/1000);
                /*var diff = parseInt((e.timeStamp - time)/250);
                if ($(this).hasClass('backspace')) {
                    elementoDOM.val(elementoDOM.val().substr(0, elementoDOM.val().length - diff));
                    console.log('Se eliminaron: ' + diff + ' caracteres');
                }*/
                //console.log('Dejo el boton clickeado: ' + diff + ' seg.');
            });

            $('div#keyboard').find('button').click(function(){
                var $this = $(this);
                character = $this.data('down'); // If it's a lowercase letter, nothing happens to this variable

                // Shift keys
                if ($this.hasClass('shift')) {
                    $('.letter').toggleClass('uppercase');
                    $('.symbol span').toggle();

                    shift = !shift;
			        capslock = false;
                    $this.toggleClass('active');

                    return false;
                }

                // Caps lock
                if ($this.hasClass('capslock')) {
                    $('.letter').toggleClass('uppercase');

                    capslock = true;
                    if(capslock) $this.toggleClass('active');

                    return false;
                }

                // BackSpace
                if ($this.hasClass('backspace')) {
                    var val = elementoDOM.val();
                    var pos = elementoDOM.prop("selectorStart");

                    var values = elementoDOM.val().split('');

                    elementoDOM.val(val.substr(0, val.length - 1));
                    elementoDOM.focus();
                    return false;
                }

                // Special characters
                //if ($this.hasClass('symbol')) character = $('span:visible', $this).html();
                if ($this.hasClass('space')) character = ' ';
                if ($this.hasClass('tab')) {
                    //character = "\t";
                    console.info('La tecla Tab fue presionada.');
                }
                if ($this.hasClass('renter') ||  $this.hasClass('lenter')) {

                    elementoDOM.val(elementoDOM.val()+String.fromCharCode(13, 10));
                    elementoDOM.focus();
                    return;
                }

                if ($this.hasClass('delete')) {
                    //character = "\n";
                    console.info('La tecla Delete fue presionada.');
                }

                // Uppercase letter
                if ($this.hasClass('uppercase')) character = character.toUpperCase();

                // Remove shift once a key is clicked.
                if (shift) {
                    if (capslock === false) $('.letter').toggleClass('uppercase');

                    shift = false;

                    $('div#keyboard').find('button.shift').removeClass('active');
                }

                // Add the character
                //elementoDOM.html(elementoDOM.html() + character);
                elementoDOM.val(elementoDOM.val() + character);
                elementoDOM.focus();
            });
        }
    };

    // Esta función genera la instancia de nuestra Clase
    $.fn.keyboard = function(options){
        return this.each(function(){
            var oElemento = $(this);

            // Si ya se cuenta con una instancia del objeto
            // hacemos un return para evitar generarla nuevamente
            if(oElemento.data('pluginKeyboard')) return;

            // aquí generamos el objeto donde ingresamos el parametro
            // "this" que sera nuestro elemento
            var oKeyboard = new Keyboard(oElemento, options);
            oKeyboard.init();

            // Ahora guardamos la instancia del objeto en el elemento
            oElemento.data('pluginKeyboard', oKeyboard);
        });
    };
})(jQuery);
