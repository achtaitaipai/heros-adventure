# Heros Adventure

## Getting started

- Create a new file `mygame.html`
- Copy and paste the code below
- Save the file
- Open `mygame.html` with a modern browser

```html
<!doctype html>
<html>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>John Wick</title>
	</head>

	<body>
		<script type="module">
			import {
				createGameState,
				createSound,
				startGame,
			} from 'https://unpkg.com/heros-adventure'

			const myGame = createGameState({
				player: {
					sprite: `
			                    ...99...
			                    ...88...
			                    .000000.
			                    0.0000.0
			                    8.0000.8
			                    ..3333..
			                    ..3..3..
			                    ..0..0..
			                `,
					position: [4, 4],
				},

				templates: {
					X: {
						sprite: 9,
						sound: createSound('HIT', 999),
					},
					R: {
						sprite: 3,
						dialog: "I'm a blue square.",
					},
					G: {
						sprite: 7,
						solid: false,
						dialog: "I'm grass.",
					},
				},

				map: `
		                    XXXXXXXXXXXXXXXX
		                    X..............X
		                    X...........G..X
		                    X..............X
		                    X..............X
		                    X....R.........X
		                    X..............X
		                    XXXXXXXXXXXXXXXX
		                `,
			})

			startGame({
				game: myGame,
				title: 'A game',
			})
		</script>
	</body>
</html>
```

## Palette

| index | color  | code    |
| ----- | ------ | ------- |
| 0     | black  | #212529 |
| 1     | white  | #f8f9fa |
| 2     | gray   | #ced4da |
| 3     | blue   | #228be6 |
| 4     | red    | #fa5252 |
| 5     | yellow | #fcc419 |
| 6     | orange | #ff922b |
| 7     | green  | #40c057 |
| 8     | pink   | #f06595 |
| 9     | brown  | #a52f01 |
