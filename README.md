# jquery.keyboard
jQuery Keyboard is a jQuery plugin for draw a virtual keyboard. jQuery and Bootstrap are required.

## Current Version
0.0.1

## Demo
- Run on browser template/index.html

#### Minified

## Characteristic

## Quick start

###3 Easy Steps
1. Link to jquery.virtual_plugin.css `<link href="assets/plugin/jquery.virtual_plugin/jquery.virtual_plugin.css" rel="stylesheet"/>`

2. Link to jquery.virtual_plugin.js `<script src="assets/plugin/jquery.virtual_plugin/jquery.virtual_plugin.js"></script>`

3. Define a keyboard object to work with a input HTML5 element(imput, textarea):
	$('textarea').keyboard({});

4. You can pass many options to personalize the keyboard:
	$('textarea').keyboard({
        theme: 'default',
        is_hidden: false,
        close_speed: 1000,
        enabled: false,
        layout: 'en_US',
        trigger: '#buttom1'
    });

### Options
	type: 'gatekeeper',         // Tipo de teclado a dibujar
    theme: 'default',           // Tema o estilo de CSS k se le aplicara al teclado
                                // Temas disponibles: default, monokai, orange
    language: 'en_US',          // Lenguaje k se utilizara para dibujar el teclado
    active_shift: false,
    active_caps: false,

    is_hidden: true,            // Si el teclado se inicializa oculto o no
    open_speed: 300,            // Velocidad con k se muestra el teclado, default: 0.3 seg. Solo si is_hidden: true
    close_speed: 300,           // Velocidad con k se esconde el teclado, default: 0.1 seg. Solo si is_hidden: true
    show_on_focus_in: true,     // Mostrar el teclado cuando pierda el focus el input. Solo si is_hidden: true
    hide_on_focus_out: true,    // Esconder el teclado cuando pierda el focus el input. Solo si is_hidden: true

    trigger: undefined,         // Id del selector k al ser clickeado mostrara el teclado, ejemplo un boton

    enabled: true

### Ventajas
	1. Posee varios temas para personalizar el keyboard

	2. Se pueden dibujar keyboard de varios tipos:
		2.1- Gatekeeper
		2.2- Full Keyboard
		2.3- KeyPad
		2.4- Numpad

	3. Se pueden escoger el idioma del teclado a dibujar, si se define que el tipo de teclado sera: 'Full Keyboard' o 'KeyPad'. Entre los que tenemos:
		3.1- en_US
		3.2- ru_RU
		3.3- es_ES
		3.4- pt_PT
		3.5- it_IT

	4. Usa Bootstrap

	5. Posee varias opciones de personalizacion del comportamiento del keyboard.

### Desventajas
	1. Se debe implementar un Diseño Responsive.

	2. Implementar los tipos de teclados: 'Keypad', 'Numpad' y 'Full Keyboard'.

	3. Mejorar los temas disponibles: 'Apple iOS', 'Monokai', 'Orange'; y agregar varios más.

	4. Agregar los idiomas para los teclados: 'Full Keyboard' y 'Keypad'. Actualmente solo disponible: 'en_US'.

## Author
**Ernesto Pérez Amigo**


## Credits
Inspired by https://github.com/mBut/jquery.mlkeyboard/.


## Copyright
Copyright © 2015 [Ernesto Pérez Amigo]

## License


