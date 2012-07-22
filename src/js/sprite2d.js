/**********************************************************************
 ****** REQUIREMENTS
 *********************************************************************/
var stringToFunction = function(str, object) {
	var arr = str.split(".");
	if (typeof object == 'undefined') object = window;

	var fn = (object || this);
	for (var i = 0, len = arr.length; i < len; i++) {
		if (typeof fn[arr[i]] == 'undefined' || fn[arr[i]] == null) {
			if (console && console.log) console.log(object);
			throw new Error("function "+str+" not found");
		}
		fn = fn[arr[i]];
	}

	if (typeof fn !== "function") {
		throw new Error("function "+str+" not found");
	}

	return fn;
};

var stringToObject = function(str, object) {
	var arr = str.split(".");
	if (typeof object == 'undefined') object = window;

	var fn = (object || this);
	for (var i = 0, len = arr.length; i < len; i++) {
		if (typeof fn[arr[i]] == 'undefined' || fn[arr[i]] == null) {
			if (console && console.log) console.log(object);
			throw new Error("object "+str+" not found");
		}
		fn = fn[arr[i]];
	}

	if (typeof fn !== "object") {
		throw new Error("object "+str+" not found");
	}

	return fn;
};


/**
 * 
 * This plugin allows you to rotate an DOM element (e.g. div) by the amount of degrees given.
 *
 * @param degress int 		Degrees (0-360)
 * @param options Object	Options (not yet implemented in version 0.1)
 *
 */
(function( $ ){
	$.fn.jqrotate = function(degrees, options) {

		degrees %= 360;

		var options = $.extend({ 
			animate : false // not yet implemented
		}, options);

		return this.each(function() {
			var $this = $(this);

			var oObj = $this[0];
			var deg2radians = Math.PI * 2 / 360;

			var rad = degrees * deg2radians;
			var costheta = Math.cos(rad);
			var sintheta = Math.sin(rad);

			a = parseFloat(costheta).toFixed(8);
			b = parseFloat(-sintheta).toFixed(8);
			c = parseFloat(sintheta).toFixed(8);
			d = parseFloat(costheta).toFixed(8);

			if ($.browser.msie) {
				var circle = $this.data('rotationcircle');
				if (circle == null) {
					circle = {
						x: $this.position().left,
						y: $this.position().top,
						r: $this.height() / 2
					};
					$this.data('rotationcircle', circle);
				}

				var ry = circle.r * Math.sin(rad);
				var rx = circle.r * Math.sin(rad % Math.PI - Math.PI / 2);
				//var rx = circle.r * Math.sin(rad * 2 - Math.PI / 2) / 2 + 0.5;
				//var dy = circle.r * (0.5 - 0.5 * Math.cos(2 * rad));
				//var rx = 100;

				var dy = 0;
				var dx = 0;

				if (degrees >= 0 && degrees <= 180) {
					dx = -ry;
				} else {
					dx = ry;
				}
				if (degrees >= 0 && degrees <= 90 || degrees >= 180 && degrees <= 270) {
					dy = circle.r + rx;
				} else {
					dy = circle.r - rx;
				}

				//alert($this.css('left'));
				//alert(dy);
				$this.css({
					left: circle.x + dx
					,top: circle.y + dy
				});
				//alert($this.css('left'));
			}

			$this.css({
				'-ms-filter':			'progid:DXImageTransform.Microsoft.Matrix(M11=' + a + ', M12=' + b + ', M21=' + c + ', M22=' + d + ',sizingMethod=\'auto expand\')',
				'filter':				'progid:DXImageTransform.Microsoft.Matrix(M11=' + a + ', M12=' + b + ', M21=' + c + ', M22=' + d + ',sizingMethod=\'auto expand\')',
				'-moz-transform':		"matrix(" + a + ", " + c + ", " + b + ", " + d + ", 0, 0)",
				'-webkit-transform':	"matrix(" + a + ", " + c + ", " + b + ", " + d + ", 0, 0)",
				'-o-transform':			"matrix(" + a + ", " + c + ", " + b + ", " + d + ", 0, 0)"
			});
		});
	};
})( jQuery );



(function( $ ){
/**********************************************************************
 ****** CONSTANTS
 *********************************************************************/

	SPRITE2D_NAMESPACE = 'sprite2d'








/**********************************************************************
 ****** CLASSES BLOCK
 *********************************************************************/

	$.extend({sprite2d: {
		Scene: function() {
			this.element = null;
			this.data = null;

			this.timer = null;
			this.running = false;
			this.frameRate = 60;
			this.sprites = {};
			this.buttons = {};
			this.checkFunctions = [];
		}

		,Sprite: function() {
			this.element = null;
			this.data = null;
			this.running = false;

			this.scene = null;
			this.width = 0;
			this.height = 0;
			this.position = {x:0, y:0};
			this.absolutePosition = {x:0, y:0};
			this.children = {};
			this.rotation = null;
		}

		,Button: function() {
			$.sprite2d.Sprite.apply(this, arguments);
		}
	}});


	/********************************************************************************
	** SCENE
	********************************************************************************/


	$.extend($.sprite2d.Scene.prototype, {
		setElement: function(element) {
			this.element = element;
			this.element.data(SPRITE2D_NAMESPACE+'_instance', this);
		}

		,setData: function(data) {
			this.data = data;
		}

		,setSprite: function(id, sprite) {
			if (this.sprites[id]) {
				var i = 1;
				if ($.isArray(this.sprites[id])) {
					i = this.sprites[id].push(sprite) - 1;
				} else {
					this.sprites[id] = [this.sprites[id], sprite];
				}
				this.sprites[id][i].setScene(this);
			} else {
				this.sprites[id] = sprite;
				this.sprites[id].setScene(this);
			}
		}

		,setButton: function(id, button) {
			this.buttons[id] = button;
			this.buttons[id].setScene(this);
		}

		,setFrameRate: function(frameRate) {
			this.frameRate = frameRate;
			if (this.running) this.startTimer();
		}

		,run: function() {
			this.element.show();
			this.notifySprites('run');

			// initalize frame fun
			if (this.update) {
				this.startTimer();
			} else
			for (var i in this.sprites) {
				if ($.isArray(this.sprites[i])) {
					for (var j in this.sprites[i]) {
						if (this.sprites[i][j].update) {
							this.startTimer();
							break;
						}
					}
				} else if (this.sprites[i].update) {
					this.startTimer();
					break;
				}
			}
		}

		,startTimer: function() {
			this.running = true;
			var oldTime = new Date();
			var that = this;
			var first = true;
			if (this.timer) window.clearTimeout(this.timer);
			var cycleFunction = function(){

				// first call update on scene
				if (that.update) that.update(((new Date()).getTime() - oldTime.getTime()) / 1000, first);
				// then on its sprites
				that.notifySprites('update', [((new Date()).getTime() - oldTime.getTime()) / 1000, first], function() {
					// this context is the sprite
					return !this.running;
				});

				if (that.draw) that.draw();
				that.notifySprites('draw');

				first = false;

				var newTimeout = Math.abs(1000 / that.frameRate - ((new Date()).getTime() - oldTime.getTime()) / 1000) % (1000 / that.frameRate);
				oldTime = new Date();
				for (var i in that.checkFunctions) {
					var cf = that.checkFunctions[i];
					if (typeof cf.testCycle == 'undefined' || (new Date()).getTime() - (cf.lastRun ? cf.lastRun : cf.lastRun = new Date()).getTime() >= cf.testCycle) {
						cf.lastRun = new Date();
						cf.callback.apply(cf.reference, [cf.testFunction.apply(cf.reference, [])]);
					}
				}

				if (!that.running) {
					window.clearTimeout(that.timer);
					return false;
				} else {
					window.setTimeout(cycleFunction, newTimeout);
				}
			};
			this.timer = window.setTimeout(cycleFunction, 1000 / this.frameRate);
		}

		/**
		 * calls the requested method on all sprites of this scene, if it exists
		 * with the given arguments. if the optional filterCallback is provided,
		 * it is called every time in the context of the sprite and if it returns
		 * true, the sprite is not notified.
		 */
		,notifySprites: function(method, args, filterCallback) {
			if (typeof args == 'undefined') args = [];
			for (var i in this.sprites) {
				if ($.isArray(this.sprites[i])) {
					for (var j in this.sprites[i]) {
						if (!this.sprites[i][j][method]) continue;
						if (typeof filterCallback == 'function' && filterCallback.apply(this.sprites[i][j], []) ) continue;
						this.sprites[i][j][method].apply(this.sprites[i][j], args);
					}
				} else if (!this.sprites[i][method]) continue; //throw new Error('method '+method+' does not exist on '+this.sprites[i]+' : '+i);
				else {
					if (!this.sprites[i][method]) continue;
					if (typeof filterCallback == 'function' && filterCallback.apply(this.sprites[i], []) ) continue;
					this.sprites[i][method].apply(this.sprites[i], args);
				}
			}
		}

		,registerCheckFunction: function(reference, testFunc, callback, testCycle) {

			this.checkFunctions.push({
				reference: reference,
				testFunction: testFunc,
				callback: callback,
				testCycle: testCycle
			});
		}
	});


	/********************************************************************************
	** SPRITE
	********************************************************************************/

	$.extend($.sprite2d.Sprite.prototype, {
		setElement: function(element) {
			this.element = element;
			this.element.data(SPRITE2D_NAMESPACE+'_instance', this);
			this.running = false;
		}

		,setData: function(data) {
			this.data = data;
		}

		,setScene: function(scene) {
			this.scene = scene;
		}

		,getAbsolutePosition: function(noCache) {
			if (typeof noCache == 'undefined' || !noCache) return this.absolutePosition;

			this.absolutePosition.x = this.position.x;
			this.absolutePosition.y = this.position.y;

			var c = this.element.sprite2d('getConfig');
			var parents = this.element.parents(c.spriteSelector);
			if (parents.length == 0) {
				return this.absolutePosition;
			}
			var that = this;
			parents.each(function(index) {
				var sprite = $(this).data(SPRITE2D_NAMESPACE+'_instance');
				that.absolutePosition.x += sprite.position.x;
				that.absolutePosition.y += sprite.position.y;
			});
			return this.absolutePosition;
		}

		,setChildSprite: function(id, sprite) {
			if (this.children[id]) {
				var i = 1;
				if ($.isArray(this.children[id])) {
					i = this.children[id].push(sprite) - 1;
				} else {
					this.children[id] = [this.children[id], sprite];
				}
				this.children[id][i].setScene(this);
			} else {
				this.children[id] = sprite;
				this.children[id].setScene(this);
			}
		}

		,run: function() {
			this.position.x = this.element.position().left;
			this.position.y = this.element.position().top;
			this.width = this.element.width();
			this.height = this.element.height();
			this.running = true;
			this.getAbsolutePosition(true);
		}

		,draw: function() {
			if (this.rotation != null) {
				this.element.jqrotate(this.rotation);
			} else {
				this.element.css({
					left: this.position.x,
					top: this.position.y
				});
			}
		}
	});



	/********************************************************************************
	** BUTTON
	********************************************************************************/

	$.sprite2d.Button.prototype = new $.sprite2d.Sprite();
	$.sprite2d.Button.prototype.constructor = $.sprite2d.Button;
	$.extend($.sprite2d.Button.prototype, {
		setElement: function() {
			// call method in supertype
			$.sprite2d.Sprite.prototype.setElement.apply(this, arguments);

			// get options
			var options = this.element.sprite2d('getConfig');

			// initialize click action
			var callAttr = this.element.attr(options.actionAttribute);
			if (!callAttr) return;

			callAttr = callAttr.split(':');
			var method = callAttr.shift();

			if (this.element.attr('data-sprite2d-backgroundPosition')) {
				var mouseActions = $.parseJSON(this.element.attr('data-sprite2d-backgroundPosition'));
				if (mouseActions.hover) {
					this.element.hover(function() {
						$(this).css({
							'background-position': mouseActions.hover
						});
					});
				}
				if (mouseActions.mousedown) {
					this.element.mousedown(function() {
						$(this).css({
							'background-position': mouseActions.mousedown
						});
					});
				}
				if (mouseActions.mouseup) {
					this.element.mouseup(function() {
						$(this).css({
							'background-position': mouseActions.mouseup
						});
					});
				}
			}

			// if method starts with game (which is a fake)
			method = method.split('.');
			if (method[0] == 'game') {
				method.shift();
				if (method.length != 1) {
					throw new Error('this.game actions must only have a method name not more: ' + method.join('.'));
				}

				this.element.click(function() {
					$(this).sprite2df(method[0], callAttr);
				});
				return;
			}

			// otherwise search it and call it
			var f = stringToFunction(method.join('.'), this);
			var that = this;
			this.element.click(function() {
				f.apply(that, callAttr);
			});
		}
	});








/**********************************************************************
 ****** JQUERY  PLUGIN  BLOCK
 *********************************************************************/

	var methods = {
		init : function( options ) {
			var $this = $(this);

			options = options || {};

			// configuration, ids, selectors, layouting
			options.gameAttribute				= options.gameAttribute				|| 'data-sprite2d-game'; // WARNING! this must be hardcoded in getConfig-method
			options.sceneAttribute				= options.sceneAttribute			|| 'data-sprite2d-scene';
			options.buttonAttribute				= options.buttonAttribute			|| 'data-sprite2d-button';
			options.actionAttribute				= options.actionAttribute			|| 'data-sprite2d-action';
			options.spriteAttribute				= options.spriteAttribute			|| 'data-sprite2d-sprite';
			options.classAttribute				= options.classAttribute			|| 'data-sprite2d-class';
			options.dataAttribute				= options.dataAttribute				|| 'data-sprite2d-data';
			options.showWhenAttribute			= options.showWhenAttribute			|| 'data-sprite2d-showWhen';
			options.spriteSelector				= options.spriteSelector			|| '*['+options.spriteAttribute+']';
			options.buttonSelector				= options.buttonSelector			|| '*['+options.buttonAttribute+']';
			options.sceneSelector				= options.sceneSelector				|| '*['+options.sceneAttribute+']';
			options.frameRate					= options.frameRate					|| 30;
			options.autoStart					= typeof options.autoStart == 'undefined' ? true : options.autoStart;

			// internal data, dom-nodes and so on
			options.objectModel = {
				scenes: {}
			}
			options.currentScene = null;

			// save options on node
			$this.data(SPRITE2D_NAMESPACE, options);

			$this.sprite2d('populate');

			if (options.autoStart) {
				$this.sprite2d('startGame');
			}
		}

		,populate: function() {
			var $this = $(this), options = $this.sprite2d('getConfig');

			// populate scenes with sprites
			$this.find(options.sceneSelector).each(function(index) {
				var $scene = $(this);
				var scene;
				var className = $scene.attr(options.classAttribute);
				if (className) {
					var f = stringToFunction(className);
					scene = new f();
				} else {
					scene = new $.sprite2d.Scene();
				}
				scene.setElement($scene);
				scene.setFrameRate(options.frameRate);

				// check if data attribute is available on sprite
				if ($scene.attr(options.dataAttribute)) {
					scene.setData($.parseJSON($scene.attr(options.dataAttribute)));
				}

				// populate sprites of scene
				$scene.find(options.spriteSelector).each(function(spriteIndex) {
					$sprite = $(this);
					var sprite;
					var className = $sprite.attr(options.classAttribute);
					if (className) {
						var f = stringToFunction(className);
						sprite = new f();
					} else {
						sprite = new $.sprite2d.Sprite();
					}
					sprite.setElement($sprite);

					// check if data attribute is available on sprite
					if ($sprite.attr(options.dataAttribute)) {
						sprite.setData($.parseJSON($sprite.attr(options.dataAttribute)));
					}

					scene.setSprite($sprite.attr(options.spriteAttribute), sprite);
				});

				// populate buttons of scene
				$scene.find(options.buttonSelector).each(function(spriteIndex) {
					$button = $(this);
					var button;
					var className = $button.attr(options.classAttribute);
					if (className) {
						var f = stringToFunction(className);
						button = new f();
					} else {
						button = new $.sprite2d.Button();
					}
					button.setElement($button);

					scene.setButton($button.attr(options.buttonAttribute), button);
				});

				options.objectModel.scenes[$scene.attr(options.sceneAttribute)] = scene;
			});

			for (var i in options.objectModel.scenes) {
				var scene = options.objectModel.scenes[i];
				for (var j in scene.sprites) {
					if ($.isArray(scene.sprites[j])) {
						for (var k in scene.sprites[j]) {
							scene.sprites[j][k].element.find(options.spriteSelector).each(function(index) {
								$child = $(this);
								scene.sprites[j][k].setChildSprite($child.attr(options.spriteAttribute), $child.data(SPRITE2D_NAMESPACE+'_instance'));
							});
						}
					} else {
						scene.sprites[j].element.find(options.spriteSelector).each(function(index) {
							scene.sprites[j].setChildSprite($child.attr(options.spriteAttribute), $child.data(SPRITE2D_NAMESPACE+'_instance'));
						});
					}
				}

				$this.find(options.spriteSelector).each(function(index) {
					// check if showwhen attribute is available on sprite
					$sprite = $(this);
					if ($sprite.attr(options.showWhenAttribute)) {
						var instance = $sprite.data(SPRITE2D_NAMESPACE+'_instance');
						var callRef = $sprite.attr(options.showWhenAttribute).split('.');
						var method = callRef.splice(callRef.length-1, 1);
						reference = stringToObject(callRef.join('.'), instance);
						
						if (!reference || !reference[method] || typeof reference[method] != 'function') throw new Error('Could not register showWhen: '+$sprite.attr(options.showWhenAttribute));

						var ref = $sprite;
						scene.registerCheckFunction(reference, reference[method], function(showWhen) {
							if (showWhen) {
								ref.show();
							} else {
								ref.hide();
							}
						}, 400);
					}
				});
			}
		}

		,startGame: function() {
			var $this = $(this), options = $this.sprite2d('getConfig');

			var scene = $this.sprite2d('currentScene');
			if (scene == null) {
				for (var i in options.objectModel.scenes) {
					options.currentScene = i;
					break;
				}
				scene = $this.sprite2d('currentScene');
			}
			if (scene) scene.run();
		}

		,switchScene: function(scene) {
			var $this = $(this), options = $this.sprite2d('getConfig'), $game = $(this).sprite2d('getGame');

			$game.find(options.sceneSelector).hide();
			$game.find('*['+options.sceneAttribute+'="'+scene+'"]').show();

			options.currentScene.running = false;

			options.currentScene = scene;
			var cs = $game.sprite2d('currentScene');
			if (!cs) throw new Error('Scene '+scene+' not found!');
			cs.run();
		}

		,currentScene: function() {
			var $this = $(this), options = $this.sprite2d('getConfig');

			if (options.currentScene == null) return null;

			if (!options.objectModel.scenes[options.currentScene]) return null;

			return options.objectModel.scenes[options.currentScene];
		}

		,getConfig: function() {
			return $(this).sprite2d('getGame').data(SPRITE2D_NAMESPACE); // WARNING! this attribute is also an option field!
		}

		,getGame: function() {
			var gameSelector = 'data-sprite2d-game';
			if ($(this).attr(gameSelector)) return $(this);
			else return $($(this).parents('*['+gameSelector+']')[0]);
		}
	};

	$.fn.sprite2d = function( method ) {

		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' + method + ' does not exist on jQuery.sprite2d' );
		}

	};
	$.fn.sprite2df = function( method, args ) {

		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, args);
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' + method + ' does not exist on jQuery.sprite2d' );
		}

	};
})( jQuery );