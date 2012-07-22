(function( $ ){
	if (!$.exampleGame) $.extend({exampleGame: {}});

	/*#############################################################################
	*
	*	circle scene class
	*
	**############################################################################*/

	$.extend($.exampleGame, {
		CircleScene: function() {
			$.sprite2d.Scene.apply(this, arguments);
		}
	});

	$.exampleGame.CircleScene.prototype = new $.sprite2d.Scene();
	$.exampleGame.CircleScene.prototype.constructor = $.exampleGame.CircleScene;
	$.extend($.exampleGame.CircleScene.prototype, {

		run: function() {
			$.sprite2d.Scene.prototype.run.apply(this, arguments);
		}

		,update: function(dt, first) {
		}
	});


	/*#############################################################################
	*
	*	move scene class
	*
	**############################################################################*/

	$.extend($.exampleGame, {
		MoveScene: function() {
			$.sprite2d.Scene.apply(this, arguments);
		}
	});

	$.exampleGame.MoveScene.prototype = new $.sprite2d.Scene();
	$.exampleGame.MoveScene.prototype.constructor = $.exampleGame.MoveScene;
	$.extend($.exampleGame.MoveScene.prototype, {

		run: function() {
			$.sprite2d.Scene.prototype.run.apply(this, arguments);
		}

		,update: function(dt, first) {
		}
	});


})(jQuery);