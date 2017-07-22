exports.generateRandomId = (len = 8) => {

	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let length = len;
	let id = '';
	while(length--) {
		id += chars[Math.random() * chars.length | 0]
	}
	return id;
}

exports.generateRandomColor = () => {
	// return '#' + (0x1000000 + Math.random() * 0xFFFFFF).toString(16).substr(1,6);
	return `hsl(${Math.floor( 360 * Math.random())}, 95%, 45%)`;
}