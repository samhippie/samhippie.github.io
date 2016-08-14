var ROWS = 9;
var COLS = 5;

var isUserWhite = false;

var userRows = 4;//how many rows the user can use for pieces

//size of each square
var sqWidth;
var sqHeight;

var ctx;

var Colors = 
{
	white : "rgb(255,255,255)",
	black : "rgb(0,0,0)",
	//use this website to make transform the colors evenly
	//http://colorizer.org
	invalidWhite : "rgb(255,210,205)",
	invalidBlack : "rgb(60,0,0)"
};

//js doesn't have a good enum
var Pieces =
{
	blackPawn : 1,
	blackKnight : 2,
	blackBishop : 3,
	blackRook : 4,
	blackQueen : 5,
	blackKing : 6,

	whitePawn : 7,
	whiteKnight : 8,
	whiteBishop : 9,
	whiteRook : 10,
	whiteQueen : 11,
	whiteKing : 12
};

function isPieceWhite(piece)
{
	return piece >= 7 && piece <= 12;
}

var pieceImages = {};
function preloadPieces()
{
	pieceImages[Pieces.whitePawn] = new Image();
	pieceImages[Pieces.whitePawn].src = "res/pieces/whitePawn.png";
	pieceImages[Pieces.whiteKnight] = new Image();
	pieceImages[Pieces.whiteKnight].src = "res/pieces/whiteKnight.png";
	pieceImages[Pieces.whiteBishop] = new Image();
	pieceImages[Pieces.whiteBishop].src = "res/pieces/whiteBishop.png";
	pieceImages[Pieces.whiteRook] = new Image();
	pieceImages[Pieces.whiteRook].src = "res/pieces/whiteRook.png";
	pieceImages[Pieces.whiteQueen] = new Image();
	pieceImages[Pieces.whiteQueen].src = "res/pieces/whiteQueen.png";
	pieceImages[Pieces.whiteKing] = new Image();
	pieceImages[Pieces.whiteKing].src = "res/pieces/whiteKing.png";

	pieceImages[Pieces.blackPawn] = new Image();
	pieceImages[Pieces.blackPawn].src = "res/pieces/blackPawn2.png";
	pieceImages[Pieces.blackKnight] = new Image();
	pieceImages[Pieces.blackKnight].src = "res/pieces/blackKnight2.png";
	pieceImages[Pieces.blackBishop] = new Image();
	pieceImages[Pieces.blackBishop].src = "res/pieces/blackBishop2.png";
	pieceImages[Pieces.blackRook] = new Image();
	pieceImages[Pieces.blackRook].src = "res/pieces/blackRook2.png";
	pieceImages[Pieces.blackQueen] = new Image();
	pieceImages[Pieces.blackQueen].src = "res/pieces/blackQueen2.png";
	pieceImages[Pieces.blackKing] = new Image();
	pieceImages[Pieces.blackKing].src = "res/pieces/blackKing2.png";
}

//pre-DOM
function canvasInit()
{
	preloadPieces();
}


//select a spawn piece based on where the user picked
var spawnPiece = null;
function setSpawn(r,c,ctx)
{
	if(isUserWhite)
	{
		if(r == userRows+1)
		{
			if(c == COLS)
				spawnPiece = Pieces.whitePawn;
			else if(c == COLS+1)
				spawnPiece = Pieces.whiteKnight;
			else if(c == COLS+2)
				spawnPiece = Pieces.whiteBishop;
			else
				return false;
		}
		else if(r == userRows+2)
		{
			if(c == COLS)
				spawnPiece = Pieces.whiteRook;
			else if(c == COLS+1)
				spawnPiece = Pieces.whiteQueen;
			else if(c == COLS+2)
				spawnPiece = Pieces.whiteKing;
			else return false;
		}
		else
			return false;
	}
	else
	{
		if(r == userRows-2)
		{
			if(c == COLS)
				spawnPiece = Pieces.blackPawn;
			else if(c == COLS+1)
				spawnPiece = Pieces.blackKnight;
			else if(c == COLS+2)
				spawnPiece = Pieces.blackBishop;
			else
				return false;
		}
		else if(r == userRows-1)
		{
			if(c == COLS)
				spawnPiece = Pieces.blackRook;
			else if(c == COLS+1)
				spawnPiece = Pieces.blackQueen;
			else if(c == COLS+2)
				spawnPiece = Pieces.blackKing;
			else
				return false;
		}
		else
			return false;
	}

	//redrawn side of board
	drawSpawns(isUserWhite,ctx);
	//draw a selection indicator
	ctx.strokeStyle = "blue";
	ctx.strokeRect(c * sqWidth + 1, r * sqHeight + 1, sqWidth - 1, sqHeight - 1);
}

//array of (Pieces.*, r, c) tuples
var spawnedPieces = [];
for(var i = 0; i < ROWS * COLS; i++)
{
	spawnedPieces[i] = 0;
}
//put a piece on the board and save its location
//also keep track of what pieces we've picked
//and handle editing/removing pieces
function setSpawnPiece(r,c,ctx)
{
	if(spawnPiece == null || !isValid(r,c,isUserWhite))
		return;
	if(spawnedPieces[r*COLS + c] == 0)
	{
		spawnedPieces[r*COLS + c] = spawnPiece;
		drawPiece(spawnPiece, r, c, ctx);
	}
	else
	{
		spawnedPieces[r*COLS + c] = 0;
		drawSquare(r,c,isUserWhite,ctx);
	}
	console.log(spawnedPieces);
}

var curPieces;
function setPieces(pieces)
{
	for(var r = 0; r < ROWS; r++)
	{
		for(var c = 0; c < COLS; c++)
		{
			if(pieces[c + r*COLS] != 0)
			{
				drawPiece(pieces[c + r*COLS],r,c,ctx);
			}
		}
	}
	curPieces = pieces.slice();
}

//post-DOM
var selectedPiecePos;
function canvasMain(setup)
{
	//setup
	var canvas = document.getElementById("setupcanvas");
	ctx = canvas.getContext("2d");
	var width = ctx.canvas.width;
	var height = ctx.canvas.height;

	ctx.fillStyle = "white";
	ctx.fillRect(0,0,width,height);

	selectedPiecePos = null;

	//getting square sized
	sqWidth = width / (2 * COLS);//only left half will be board
	sqHeight = height / ROWS;
	
	//input
	//canvas.addEventListener("mousedown", function(event)
	canvas.onmousedown = function(event)
			{
				var x = event.layerX - canvas.offsetLeft;
				var y = event.layerY - canvas.offsetTop;
				var c = Math.floor(x / sqWidth);
				var r = Math.floor(y / sqHeight);

				if(setup)
				{
					//if user didn't select a spawn point
					if(!setSpawn(r,c,ctx) && r < ROWS && c < COLS)
					{
						setSpawnPiece(r,c,ctx);
					}
				}
				else
				{
					//user selected own piece
					cur = curPieces[c + r*COLS];
					console.log(cur);
					if(cur != 0 && isPieceWhite(cur) == isUserWhite)
					{
						//redraw
						drawBoard(ctx);
						setPieces(curPieces);
						//draw indicator
						ctx.strokeStyle = "blue";
						ctx.strokeRect(c * sqWidth + 1, 
									   r * sqHeight + 1, 
									   sqWidth - 1, 
									   sqHeight - 1);
						selectedPiecePos = [r,c];
					}
					//user wants to move their piece
					else if(selectedPiecePos != null)
					{
						var pr = selectedPiecePos[0];
						var pc = selectedPiecePos[1];
						var p = curPieces[pc + pr*COLS];
						curPieces[pc + pr*COLS] = 0;
						curPieces[c + r*COLS] = p;
						drawBoard(ctx);
						setPieces(curPieces);
						selectedPiecesPos = null;
					}
				}
			};

	//drawing
	setIsValidCheck(setup);
	drawBoard(ctx);
	if(setup)
	{
		drawSpawns(isUserWhite,ctx);
	}
}

function drawSpawns(isUserWhite, ctx)
{
	ctx.fillStyle = "white";
	ctx.fillRect(sqWidth * COLS, 0, sqWidth * COLS,ctx.canvas.height);
	//the offsets here are based on how many rows the user has to place
	//pieces (userRows) and the number of columns (COLS)
	//The pieces should align with the user's rows closest to the center
	//and be past the furthest column
	if(isUserWhite)
	{
		drawPiece(Pieces.whitePawn, userRows+1, COLS, ctx);
		drawPiece(Pieces.whiteKnight, userRows+1, COLS+1, ctx);
		drawPiece(Pieces.whiteBishop, userRows+1, COLS+2, ctx);
		drawPiece(Pieces.whiteRook, userRows+2, COLS, ctx);
		drawPiece(Pieces.whiteQueen, userRows+2, COLS+1, ctx);
		drawPiece(Pieces.whiteKing, userRows+2, COLS+2, ctx);
	}
	else
	{
		drawPiece(Pieces.blackPawn, userRows-2, COLS, ctx);
		drawPiece(Pieces.blackKnight, userRows-2, COLS+1, ctx);
		drawPiece(Pieces.blackBishop, userRows-2, COLS+2, ctx);
		drawPiece(Pieces.blackRook, userRows-1, COLS, ctx);
		drawPiece(Pieces.blackQueen, userRows-1, COLS+1, ctx);
		drawPiece(Pieces.blackKing, userRows-1, COLS+2, ctx);
	}
}

function drawPiece(piece, r, c, ctx)
{
	var img = pieceImages[piece];
	//scale the image so it fills either the height or the width
	var scaleWidth;
	var scaleHeight;
	var rowOffset;
	var colOffset;
	if(img.width > img.height)
	{
		scaleWidth = sqWidth;
		scaleHeight = img.height * sqWidth / img.width;
		colOffset = 0;//we take up entire col
		rowOffset = (sqHeight - scaleHeight) / 2;
	}
	else
	{
		scaleHeight = sqHeight;
		scaleWidth = img.width * sqWidth / img.height;
		rowOffset = 0;//we take up entire row
		colOffset = (sqWidth - scaleWidth) / 2;
	}
	ctx.drawImage(img, c * sqWidth + colOffset, r * sqHeight + rowOffset, scaleWidth, scaleHeight);
}

var isValidCheck = true;
//whether to do the validity check
//useful for draft
function setIsValidCheck(check)
{
	isValidCheck = check;
}

//checks if a square is valid for a player
function isValid(r,c,isUserWhite)
{
	if(!isValidCheck)
		return true;
	if(isUserWhite)
		return r >= ROWS - userRows;
	else
		return r < userRows;
}

function drawSquare(r,c,isUserWhite,ctx)
{
	var valid = isValid(r,c,isUserWhite);
	isWhite = (r+c)%2 != 0
	if(valid)
		ctx.fillStyle = isWhite ? Colors.white : Colors.black;
	else
		ctx.fillStyle = isWhite ? Colors.invalidWhite : Colors.invalidBlack;
	ctx.fillRect(c*sqWidth, r*sqHeight, sqWidth, sqHeight);
}

function drawBoard(ctx)
{
	for(var r = 0; r < ROWS; r++)
	{
		for(var c = 0; c < COLS; c++)
		{
			drawSquare(r,c,isUserWhite,ctx);
		}
	}
}
