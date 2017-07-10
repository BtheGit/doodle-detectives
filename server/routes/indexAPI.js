const router 									= require('express').Router(),
			timestampAPIRoutes 			= require('./APIRoutes/timestampAPIRoutes.js'),
			headerParserAPIRoutes 	= require('./APIRoutes/headerParserAPIRoutes.js'),
			abbrURLRoutes 					= require('./APIRoutes/abbrURLRoutes.js'),
			imagesearchRoutes 			= require('./APIRoutes/imagesearchRoutes.js'),
			uploadfileRoutes				= require('./APIRoutes/uploadfileRoutes.js')


router.use('/timestamp', timestampAPIRoutes);
router.use('/headerparser', headerParserAPIRoutes);
router.use('/abbrURL', abbrURLRoutes);
router.use('/imagesearch', imagesearchRoutes);
router.use('/uploadfile', uploadfileRoutes);

module.exports = router;