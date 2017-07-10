import React, { Component } from 'react';

export default class Drawingboard extends Component {
	constructor(props) {
		super(props);
		this.ref = null;
		this.canvas = null;
		this.ctx = null;
		this.state = {
			isDrawing: false,
			startX: 0,
			startY: 0,
		}
	}

	buildPath = (x, y) => {
		return {
			name: this.props.playerName,
			id: this.props.clientId,
			color: this.props.clientColor,
			startX: this.state.startX,
			startY: this.state.startY,
			endX: x,
			endY: y
		}
		
	}

	sendPath = path => {
		this.props.emitPath(path);
	}

	drawPath = path => {
		this.ctx.strokeStyle = path.color;
		this.ctx.beginPath();
		this.ctx.moveTo(path.startX, path.startY);
		this.ctx.lineTo(path.endX, path.endY);
		this.ctx.stroke();
		//TODO: Do I need this?
		if(path.id === this.props.clientId) {
			this.setState({
				startX: path.endX,
				startY: path.endY
			});
		}
	}

	//############## LIFECYCLE & RENDER METHODS ###########

	changeResolution(canvas, context, scaleFactor) {
    // Set up CSS size if it's not set up already
    if (!canvas.style.width)
        canvas.style.width = canvas.width + 'px';
    if (!canvas.style.height)
        canvas.style.height = canvas.height + 'px';

    canvas.width = Math.ceil(canvas.width * scaleFactor);
    canvas.height = Math.ceil(canvas.height * scaleFactor);
    context.scale(scaleFactor, scaleFactor);
}

	setupCanvas = () => {
		const defaultSize = 800;
		// window.devicePixelRatio = 2;
		this.canvas = this.ref; 
		this.ctx = this.canvas.getContext('2d');
		const boundingRect = this.canvas.getBoundingClientRect();
		this.canvas.width = 800;
		this.canvas.height = 800;
		this.changeResolution(this.canvas, this.ctx, 2);
		// this.canvas.style.width = `${window.innerWidth}px`;
		// this.canvas.style.height = `${window.innerHeight}px`;
		// this.ctx.scale((this.canvas.width / this.canvas.style.width), (this.canvas.width / this.canvas.style.width))
		// this.ctx.scale((this.canvas.width / this.canvas.style.width), (this.canvas.height / this.canvas.style.height))
		// this.ctx.scale(.5, .5)
		// this.ctx.imageSmoothingEnabled = true;
		this.ctx.strokeStyle = '#BADA55';
		this.ctx.lineJoin = 'round';
		this.ctx.lineCap = 'round';
		this.ctx.lineWidth = 2;
		//attach event listeners
		this.canvas.addEventListener('mousedown', (event) => {
			this.setState({
				isDrawing: true,
				startX: event.offsetX,
				startY: event.offsetY
			});
		})
		this.canvas.addEventListener('mouseup', () => this.setState({isDrawing: false}))
		this.canvas.addEventListener('mouseout', () => this.setState({isDrawing: false}))
		this.canvas.addEventListener('mousemove', (event) => {
			//Only Draw and Emit paths if a) the game is not in session or b) it's in the drawing phase and it's your turn
			const gameActive = this.props.sessionStatus === 'isGameActive' ? true : false;
			if(gameActive && !this.props.isMyTurn) {
				return;
			} else {
				if(this.state.isDrawing) {
					const path = this.buildPath(event.offsetX, event.offsetY)
					this.sendPath(path)
					this.drawPath(path);
				}
			}
		})
		// window.addEventListener("resize", this.handleWindowResize, false);
	}

	componentDidMount = () => {
		this.props.onRef(this) //To allow Parent to access child methods
		this.setupCanvas();	
	}

	componentWillUnmount = () => {
		//remove event listeners
	}

	render() {
		return (
			<div id="canvas-container">
				<canvas ref={(ref) => {this.ref = ref}} id="drawingCanvas" />
			</div>
		)
	}
}